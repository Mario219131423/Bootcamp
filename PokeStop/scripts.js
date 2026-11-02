
const API_URL = 'https://api.tcgdex.net/v2/es/cards';

const gridContainer = document.getElementById('products-grid');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

let cart = [];

async function fetchPokemonCards() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const cards = await response.json();

        const sampleCards = cards
            .filter(card => card.image)
            .slice(0, 24);

        const detailedCards = await Promise.all(
            sampleCards.map(async card => {
                try {
                    const detailResponse = await fetch(
                        `${API_URL}/${card.id}`
                    );

                    if (!detailResponse.ok) {
                        throw new Error(`Error al consultar ${card.id}`);
                    }

                    return await detailResponse.json();

                } catch (error) {
                    console.error(error);
                    return null;
                }
            })
        );

        const validCards = detailedCards.filter(card => card !== null);

        loadingElement.style.display = 'none';

        renderCards(validCards);

    } catch (error) {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';

        errorElement.textContent =
            `No se pudieron cargar los productos: ${error.message}`;
    }
}

function getCardPrice(card) {
    const pricing = card.pricing?.tcgplayer;

    if (!pricing) {
        return null;
    }

    const variants = Object.values(pricing);

    const priceData = variants.find(variant =>
        variant &&
        typeof variant.marketPrice === 'number'
    );

    if (!priceData) {
        return null;
    }

    return {
        value: priceData.marketPrice,
        currency: pricing.unit || 'USD'
    };
}

function renderCards(cards) {
    gridContainer.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');

        cardElement.classList.add('product-card');

        const imageUrl = card.image
            ? `${card.image}/high.png`
            : 'https://via.placeholder.com/200x280?text=Sin+Imagen';

        const priceData = getCardPrice(card);

        cardElement.innerHTML = `
            <div class="card-img-container">
                <img
                    class="card-img"
                    src="${imageUrl}"
                    alt="${card.name}"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/200x280?text=Sin+Imagen';"
                >
            </div>

            <div class="card-info">
                <h2 class="card-title">${card.name}</h2>

                <button class="card-btn mt-2">
                    Ver detalle
                </button>
            </div>
        `;

        cardElement.querySelector('.card-btn').addEventListener('click', () => {
            openCardDetail(
                card.id,
                card.name,
                imageUrl,
                priceData ? priceData.value : null,
                priceData?.currency || 'USD'
            );
        });

        gridContainer.appendChild(cardElement);
    });
}

function openCardDetail(id, name, imageUrl, price, currency) {
    document.getElementById('modal-card-name').textContent = name;

    const priceElement = document.getElementById('modal-card-price');

    priceElement.textContent = price !== null
        ? `$${price.toFixed(2)} ${currency}`
        : 'Precio no disponible';

    document.getElementById('modal-card-img-container').innerHTML = `
        <img
            src="${imageUrl}"
            alt="${name}"
            class="img-fluid rounded shadow"
            style="max-height: 250px; object-fit: contain;"
        >
    `;

    const addCartBtn = document.getElementById('modal-add-cart-btn');
    const newBtn = addCartBtn.cloneNode(true);

    addCartBtn.parentNode.replaceChild(newBtn, addCartBtn);

    newBtn.disabled = price === null;

    if (price !== null) {
        newBtn.addEventListener('click', () => {
            addToCart(name, price, imageUrl);

            const modalElement = document.getElementById('cardDetailModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }

    const modalElement = document.getElementById('cardDetailModal');
    const cardModal = bootstrap.Modal.getOrCreateInstance(modalElement);

    cardModal.show();
}

function addToCart(name, price, imageUrl) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            imageUrl,
            quantity: 1
        });
    }

    updateCartUI();
    showToast(`¡"${name}" se añadió al carrito exitosamente!`);
}

function updateCartUI() {
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCountSpan.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="text-center text-muted my-3">
                Tu carrito está vacío.
            </p>
        `;

        cartTotalElement.textContent = '$0.00 USD';
        return;
    }

    let html = `
        <table class="table align-middle table-hover">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th class="text-center">Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

    let grandTotal = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;

        grandTotal += subtotal;

        html += `
            <tr>
                <td class="d-flex align-items-center gap-2 border-0">
                    <img
                        src="${item.imageUrl}"
                        alt="${item.name}"
                        style="width: 40px; height: 50px; object-fit: contain;"
                    >
                    <span class="fw-semibold">${item.name}</span>
                </td>

                <td>$${item.price.toFixed(2)} USD</td>

                <td class="text-center">
                    <div class="btn-group btn-group-sm rounded-pill overflow-hidden border">
                        <button class="btn btn-light"
                            onclick="changeQuantity(${index}, -1)">
                            <i class="bi bi-dash-lg"></i>
                        </button>

                        <span class="px-3 fw-bold d-flex align-items-center bg-white">
                            ${item.quantity}
                        </span>

                        <button class="btn btn-light"
                            onclick="changeQuantity(${index}, 1)">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </td>

                <td class="fw-bold">$${subtotal.toFixed(2)} USD</td>

                <td>
                    <button
                        class="btn btn-sm btn-outline-danger rounded-circle p-1"
                        onclick="removeItem(${index})"
                        style="width:30px; height:30px;"
                    >
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    cartItemsContainer.innerHTML = html;

    cartTotalElement.textContent = `$${grandTotal.toFixed(2)} USD`;
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function showToast(message) {
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;

    const toastElement = document.getElementById('liveToast');
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement);

    toast.show();
}

function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    alert('¡Compra realizada con éxito! Gracias por tu pedido en PokéStore TCG.');

    cart = [];

    updateCartUI();

    const cartModalElement = document.getElementById('cartModal');
    const modalInstance = bootstrap.Modal.getInstance(cartModalElement);

    if (modalInstance) {
        modalInstance.hide();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    fetchPokemonCards();
});

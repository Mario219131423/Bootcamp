const API_URL = "https://fakestoreapi.com/products";

const container = document.getElementById("product-container");

const modal = document.getElementById("product-modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalDescription = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");
const closeBtn = document.getElementById("close-btn");

function cerrarModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

window.addEventListener('click', (event) => {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

async function getProducts() {
    try {
        const response = await fetch(API_URL);

        if(!response.ok) {
            throw new Error('Error al conectar con la API');
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Hubo un error:', error);
    }
}

function renderProducts(products) {
    container.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('card');
        productCard.dataset.id = product.id;
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div>
                <h3>${product.title.substring(0, 30)}...</h3>
                <p>$${product.price}</p>
            </div>
        `;
        productCard.addEventListener('click', async() => {
            const productId = productCard.dataset.id;
            try {
                const response = await fetch(`${API_URL}/${productId}`);
                const singleProduct = await response.json();
                if (modalImg) modalImg.src = singleProduct.image;
                if (modalTitle) modalTitle.textContent = singleProduct.title;
                if (modalCategory) modalCategory.textContent = `Categoría: ${singleProduct.category}`;
                if (modalDescription) modalDescription.textContent = singleProduct.description;
                if (modalPrice) modalPrice.textContent = `$${singleProduct.price}`;
                
                if (modal) modal.style.display = 'flex';
            } catch (error) {
                console.error('Error al obtener el producto:', error);
            }
        });
        container.appendChild(productCard);
    });
}

getProducts();
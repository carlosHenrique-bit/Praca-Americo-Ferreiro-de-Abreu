const lista = document.querySelector(".list-nav");
const menu = document.querySelector(".btn-nav");    

menu.addEventListener("click", () => {
    lista.classList.toggle("list-escondido");
})

window.addEventListener("click", (event) => {
    if(!lista.classList.contains("list-escondido")) {
        if (!lista.contains(event.target) && !menu.contains(event.target)) {
            lista.classList.add("list-escondido");
        }
    }
})
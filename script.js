        window.addEventListener('load', function () {
    // Function to check if the user is on a phone or tablet
    function isMobileDevice() {
        return /Mobi|Android|iPad|iPhone|pixel|galaxy/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }

    // Show a popup if the user is on a phone or tablet
    if (isMobileDevice()) {
        const popupOverlay = document.createElement('div');
        popupOverlay.style.position = 'fixed';
        popupOverlay.style.top = '0';
        popupOverlay.style.left = '0';
        popupOverlay.style.width = '100%';
        popupOverlay.style.height = '100%';
        popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popupOverlay.style.zIndex = '9999';
        popupOverlay.style.display = 'flex';
        popupOverlay.style.alignItems = 'center';
        popupOverlay.style.justifyContent = 'center';
        popupOverlay.style.color = 'white';
        popupOverlay.style.fontSize = '1.5rem';
        popupOverlay.style.textAlign = 'center';

        const popupMessage = document.createElement('div');
        popupMessage.innerHTML = `
            <p>Most games are not supported on this device.</p>
            <p>Try playing on a PC or a laptop.</p>
            <p>Not recommended to play on your device.</p>
            <button class="return-button" style="margin-top: 20px; padding: 10px 20px; font-size: 1rem; cursor: pointer;" onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
        `;

        popupOverlay.appendChild(popupMessage);
        document.body.appendChild(popupOverlay);
    }
});

    const gameGrid = document.getElementById("game-grid");
    const gameContainer = document.getElementById("game-container");
    const gameFrame = document.getElementById("game-frame");
    const searchInput = document.getElementById("search");
    const coverURL = "https://cdn.jsdelivr.net/gh/gn-math/assets@main";
    const htmlURL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";
    const defaultCover = `${coverURL}/default.png`;
    let currentGameUrl = "";
    let allGames = [];

    fetch("https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((zones) => {
        allGames = zones;
        displayZones(zones);
      })
      .catch((err) => {
        console.error("Failed to load game list:", err);
        gameGrid.innerHTML = '<p style="color: red; text-align: center;">Failed to load games. Please try again later.</p>';
      });

    function displayZones(zones) {
      gameGrid.innerHTML = "";
      if (!Array.isArray(zones)) {
        gameGrid.innerHTML = "No zones found.";
        return;
      }

        function fullscreenZone() {
            if (zoneFrame.requestFullscreen) {
                zoneFrame.requestFullscreen();
            } else if (zoneFrame.mozRequestFullScreen) {
                zoneFrame.mozRequestFullScreen();
            } else if (zoneFrame.webkitRequestFullscreen) {
                zoneFrame.webkitRequestFullscreen();
            } else if (zoneFrame.msRequestFullscreen) {
                zoneFrame.msRequestFullscreen();
            }
        }

        function aboutBlank() {
            const newWindow = window.open("about:blank", "_blank");
            let zone = zones.find(zone => zone.id + '' === document.getElementById('zoneId').textContent).url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
            fetch(zone+"?t="+Date.now()).then(response => response.text()).then(html => {
                if (newWindow) {
                    newWindow.document.open();
                    newWindow.document.body.innerHTML = "";
                    newWindow.document.documentElement.innerHTML = html;
                    newWindow.document.close();
                }
            })
        }

      zones.forEach((file) => {
        if (file.url && file.url.includes("{HTML_URL}")) {
          const actualUrl = file.url.replace("{HTML_URL}", htmlURL);

          const zoneItem = document.createElement("div");
          zoneItem.className = "game-card";
          zoneItem.onclick = () => {
            playClickSound();
            loadGame(actualUrl);
          };

          const button = document.createElement("button");
          button.textContent = file.name;
          button.title = `Launch ${file.name}`;
          button.onclick = (event) => {
            event.stopPropagation();
            playClickSound();
            loadGame(actualUrl);
          };

          zoneItem.appendChild(button);
          gameGrid.appendChild(zoneItem);
        }
      });

      if (!gameGrid.children.length) {
        gameGrid.innerHTML = "No zones found.";
      }
    }

    function filterGames() {
      const query = searchInput.value.toLowerCase();
      const filtered = allGames.filter(game => game.name.toLowerCase().includes(query));
      displayZones(filtered);
    }

        function saveData() {
            let data = JSON.stringify(localStorage) + "\n\n|\n\n" + document.cookie;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([data], {
                type: "text/plain"
            }));
            link.download = `${Date.now()}.data`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function loadData(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                const [localStorageData, cookieData] = content.split("\n\n|\n\n");
                try {
                    const parsedData = JSON.parse(localStorageData);
                    for (let key in parsedData) {
                        localStorage.setItem(key, parsedData[key]);
                    }
                } catch (error) {
                }
                if (cookieData) {
                    const cookies = cookieData.split("; ");
                    cookies.forEach(cookie => {
                        document.cookie = cookie;
                    });
                }
                alert("Data loaded");
            };
            reader.readAsText(file);
        }

    function loadGame(url) {
      currentGameUrl = url;
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch game HTML.");
          return res.text();
        })
        .then(html => {
          const blob = new Blob([html], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          gameFrame.src = blobUrl;
          gameContainer.classList.remove("fadeOut");
          gameContainer.style.display = "block";
          window.scrollTo({ top: gameContainer.offsetTop, behavior: "smooth" });
        })
        .catch(err => {
          console.error("Failed to load game content:", err);
          alert("Could not load game.");
        });
    }

    function closeGame() {
      gameContainer.classList.add("fadeOut");
      setTimeout(() => {
        gameFrame.src = "";
        gameContainer.style.display = "none";
        gameContainer.classList.remove("fadeOut");
      }, 400);
    }

    function fullscreenGame() {
      if (!currentGameUrl) return;
      fetch(currentGameUrl)
        .then(res => res.text())
        .then(html => {
          const blob = new Blob([html], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        })
        .catch(err => {
          console.error("Failed to open fullscreen game:", err);
          alert("Could not open fullscreen.");
        });
    }

    function playClickSound() {
      const click = new Audio("baa (1).wav");
      click.play();
    }
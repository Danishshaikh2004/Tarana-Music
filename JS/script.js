console.log("JavaScript");

let songs;
let currFolder;
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li> 
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Danish Shaikh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log(songName);
            playMusic(songName);
        });
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};

async function displayAlbums() {
    try {
        console.log("Displaying albums");
        let a = await fetch(`/Playlists/`);
        if (!a.ok) throw new Error(`Failed to fetch /Playlists/: ${a.statusText}`);
        
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        let array = Array.from(anchors);

        if (array.length === 0) {
            console.warn("No albums found.");
            return;
        }

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/Playlists") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0];
                
                let metaResponse = await fetch(`/Playlists/${folder}/info.json`);
                if (!metaResponse.ok) {
                    console.error(`Failed to fetch info.json for folder ${folder}: ${metaResponse.statusText}`);
                    continue;
                }

                let metadata = await metaResponse.json();
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="popular-play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M256 73.82A182.18 182.18 0 1 0 438.18 256 182.182 182.182 0 0 0 256 73.82zm67.825 192.217L218.7 326.734a10.376 10.376 0 0 1-15.566-8.99V196.356a10.38 10.38 0 0 1 15.575-8.99l105.125 60.696a10.376 10.376 0 0 1-.009 17.974z" />
                            </svg>                      
                        </div>
                        <img src="/Playlists/${folder}/cover.jpg" alt="">
                        <h3>${metadata.title}</h3>
                        <p>${metadata.description}</p>
                    </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log("Fetching Songs");
                songs = await getSongs(`Playlists/${item.currentTarget.dataset.folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                } else {
                    console.warn(`No songs found in playlist ${item.currentTarget.dataset.folder}`);
                }
            });
        });
    } catch (error) {
        console.error("Error in displayAlbums:", error);
    }
}



async function getAndPlaySongs(folder) {
    let songs = await getSongs(`songs/${folder}`);
    if (songs.length > 0) {
        playMusic(songs[0]);
    } else {
        console.error("No songs found in the folder:", folder);
    }

}

document.querySelectorAll('.popular-card').forEach(card => {
    card.addEventListener('click', () => {
        let folder = card.getAttribute('data-folder');
        getAndPlaySongs(folder);
    });
});

async function main() {
    await getSongs("songs/");
    playMusic(songs[0], true)

    displayAlbums()

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}

main();

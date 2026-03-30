
(() => {

/*
==============================
CONFIGURATION / MUSIC ENGINE
==============================
*/

const MusicConfig = {

  NOTES: [
    "C","C#","D","D#","E",
    "F","F#","G","G#","A","A#","B"
  ],

  CHORD_SYMBOLS: {
    maj: "",
    min: "m",
    dim: "°"
  },

  BASE_SCALES: {

    major: {
      label: "Bilawal (Ionian)",
      pattern: [2,2,1,2,2,2,1],
      qualities: ["maj","min","min","maj","maj","min","dim"],
      roman: ["I","ii","iii","IV","V","vi","vii°"]
    },

    minor: {
      label: "Asawari (Aeolian)",
      pattern: [2,1,2,2,1,2,2],
      qualities: ["min","dim","maj","min","min","maj","maj"],
      roman: ["i","ii°","III","iv","v","VI","VII"]
    }

  }

};


/*
==============================
THAAT / MODE DEFINITIONS
==============================
*/

const Modes = {

  major: [

    {
      name: "Khamaj (Mixolydian)",
      desc: "♭7",
      pattern: [2,2,1,2,2,1,2],
      qualities: ["maj","min","min","maj","min","min","maj"],
      song: "Mukti dilaye yasu naam",
      detail: "Flat 7 blues flavour"
    },

    {
      name: "Kalyan (Lydian)",
      desc: "♯4",
      pattern: [2,2,2,1,2,2,1],
      qualities: ["maj","maj","min","dim","maj","min","min"],
      song: "Gao sana tusi raab di",
      detail: "Dreamy raised 4th"
    },

    {
      name: "Bhairav (Phrygian Dominant)",
      desc: "♭2 ♭6 ♭7",
      pattern: [1,2,2,1,2,2,2],
      qualities: ["maj","maj","maj","maj","maj","maj","maj"]
    }

  ],


  minor: [

    {
      name: "Kafi (Dorian)",
      desc: "♮6",
      pattern: [2,1,2,2,2,1,2],
      qualities: ["min","min","maj","maj","min","dim","maj"],
      song: "Saryo loko sady raab nu",
      detail: "Minor with natural 6"
    },

    {
      name: "Bhairavi (Phrygian)",
      desc: "♭2",
      pattern: [1,2,2,2,1,2,2],
      qualities: ["min","maj","maj","min","min","maj","maj"],
      song: "Khudaya teri rooh",
      detail: "Flamenco colour"
    }

  ]

};


/*
==============================
UTILITY FUNCTIONS
==============================
*/

const Engine = {

  scaleNotes(root, pattern) {

    let index = MusicConfig.NOTES.indexOf(root);

    return pattern.map((step, i) => {

      const note = MusicConfig.NOTES[index];

      index = (index + step) % 12;

      return note;

    });

  },


  buildChords(root, pattern, qualities) {

    let index = MusicConfig.NOTES.indexOf(root);

    return pattern.map((step, i) => {

      const note = MusicConfig.NOTES[index];

      const quality = qualities[i];

      index = (index + step) % 12;

      return note + MusicConfig.CHORD_SYMBOLS[quality];

    });

  },


  uniqueChords(modeChords, baseSet) {

    return modeChords.filter(c => !baseSet.has(c));

  }

};


/*
==============================
UI RENDERING
==============================
*/

const UI = {

  renderMainScale(root, scaleType) {

    const base = MusicConfig.BASE_SCALES[scaleType];

    const notes = Engine.scaleNotes(root, base.pattern);

    const chords = Engine.buildChords(
      root,
      base.pattern,
      base.qualities
    );

    const html = notes.map((note,i)=>

      `<div class="pill">
        ${chords[i]}
        <small>${base.roman[i]}</small>
      </div>`

    ).join("");

    document.getElementById("mainScaleCard").innerHTML = `

      <div class="scale-header">
        <span>🎼 ${root} ${base.label}</span>
        <span>diatonic · parent scale</span>
      </div>

      <div class="diatonic-pills">
        ${html}
      </div>

    `;

  },


  renderModes(root, scaleType) {

    const base = MusicConfig.BASE_SCALES[scaleType];

    const baseChords = new Set(

      Engine.buildChords(
        root,
        base.pattern,
        base.qualities
      )

    );

    const modes = Modes[scaleType];

    let outside = new Set();

    const html = modes.map(mode => {

      const scaleNotes = Engine.scaleNotes(
        root,
        mode.pattern
      );

      const modeChords = Engine.buildChords(
        root,
        mode.pattern,
        mode.qualities
      );

      const unique = Engine.uniqueChords(
        modeChords,
        baseChords
      );

      unique.forEach(c => outside.add(c));

      return `

      <div class="modal-card">

        <div class="modal-header">
          <span class="modal-name">${mode.name}</span>
          <span class="modal-desc">${mode.desc}</span>
        </div>

        <div class="scale-notes-row">

          ${
            scaleNotes
            .map(n=>`<span class="scale-note-badge">${n}</span>`)
            .join("")
          }

        </div>

        <div class="chord-chips">

          ${
            unique.length
              ? unique.map(c=>`<span class="chip">${c}</span>`).join("")
              : "✨ all chords match parent"
          }

        </div>

        <div class="song-example">

          🎧 ${mode.song || "traditional reference"}
          — ${mode.detail || "modal colour"}

        </div>

      </div>

      `;

    }).join("");

    document.getElementById("modalGroupsContainer").innerHTML = html;

    document.getElementById("outsideCount").innerText = outside.size;

  }

};


/*
==============================
APP CONTROLLER
==============================
*/

function refreshUI() {

  const root =
    document.getElementById("rootSelect").value;

  const scaleType =
    document.getElementById("scaleSelect").value;

  UI.renderMainScale(root, scaleType);

  UI.renderModes(root, scaleType);

}


/*
==============================
INIT
==============================
*/

function initRootSelector() {

  const selector =
    document.getElementById("rootSelect");

  MusicConfig.NOTES.forEach(note => {

    const option = document.createElement("option");

    option.value = note;

    option.textContent = note;

    if(note==="C") option.selected=true;

    selector.appendChild(option);

  });

}


initRootSelector();

document
.getElementById("rootSelect")
.addEventListener("change", refreshUI);

document
.getElementById("scaleSelect")
.addEventListener("change", refreshUI);

refreshUI();

})();

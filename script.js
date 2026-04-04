(() => {

const MusicConfig = {
  NOTES: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
  CHORD_SYMBOLS: { maj:"", min:"m", dim:"°" },
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

// Helper function to transpose a note by n semitones
function transposeNote(note, semitones) {
  const notes = MusicConfig.NOTES;
  let idx = notes.indexOf(note);
  if(idx === -1) return note; 
  return notes[(idx + semitones + 12) % 12];
}

// Helper to transpose chord symbols (e.g., "F#m" -> "Am")
function transposeChord(chord, semitones) {
  // Match root note (possibly with # or b) followed by optional quality
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const quality = match[2];
  const newRoot = transposeNote(root, semitones);
  return newRoot + quality;
}

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
      name: "Bhairav",
      desc: "♭2 ♮3 ♭6 ♭7",
      // Notes: C, C#, E, F, G, G#, B  (for root C)
      getNotes(root) {
        const n = MusicConfig.NOTES;
        const i = n.indexOf(root);
        return [
          n[i % 12],           // 1
          n[(i + 1) % 12],     // b2
          n[(i + 4) % 12],     // 3
          n[(i + 5) % 12],     // 4
          n[(i + 7) % 12],     // 5
          n[(i + 8) % 12],     // b6
          n[(i + 11) % 12]     // b7
        ];
      },
      qualities: ["maj","maj","maj","maj","maj","min","dim"],
      song: "Traditional Bhairav colour",
      detail: "Devotional flattened 2nd and 6th",
      chordMap: {
        "C": ["Fm", "C#"]
      }
    },
    {
      name: "Marwa",
      desc: "♭2 ♮3 ♯4 ♮6 ♮7",
      // Notes: C, C#, E, F#, A, B
      getNotes(root) {
        const n = MusicConfig.NOTES;
        const i = n.indexOf(root);
        return [
          n[i % 12],           // 1
          n[(i + 1) % 12],     // b2
          n[(i + 4) % 12],     // 3
          n[(i + 6) % 12],     // #4
          n[(i + 9) % 12],     // 6
          n[(i + 11) % 12]     // 7
        ];
      },
      qualities: ["maj","min","maj","dim","maj","min"],
      song: "Traditional Marwa mood",
      detail: "Tense sunset raga colour",
      chordMap: {
        "C": ["A", "F#m"]
      }
    },
    {
      name: "Purvi (Purbi)",
      desc: "♭2 ♯4 ♭6 ♭7",
      // Notes: C, C#, E, F#, G, G#, B  (7 notes for root C)
      getNotes(root) {
        const n = MusicConfig.NOTES;
        const i = n.indexOf(root);
        return [
          n[i % 12],           // 1 - C
          n[(i + 1) % 12],     // b2 - C#
          n[(i + 4) % 12],     // 3 - E
          n[(i + 6) % 12],     // #4 - F#
          n[(i + 7) % 12],     // 5 - G
          n[(i + 8) % 12],     // b6 - G#
          n[(i + 11) % 12]     // b7 - B
        ];
      },
      qualities: ["maj","min","maj","dim","maj","min","dim"],
      song: "Traditional Purvi mood",
      detail: "Deep twilight devotional colour",
      // Unique chords at C: F#m, E
      chordMap: {
        "C": ["F#m", "E"]
      }
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
      detail: "Flamenco colour",
      chordMap: {
        "C": ["C#","Fm"]
      }
    }
  ]
};

const Engine = {
  scaleNotes(root, pattern) {
    let index = MusicConfig.NOTES.indexOf(root);
    return pattern.map(step => {
      const note = MusicConfig.NOTES[index];
      index = (index + step) % 12;
      return note;
    });
  },
  buildChords(root, pattern, qualities) {
    let index = MusicConfig.NOTES.indexOf(root);
    return pattern.map((step,i) => {
      const note = MusicConfig.NOTES[index];
      const q = qualities[i];
      index = (index + step) % 12;
      return note + MusicConfig.CHORD_SYMBOLS[q];
    });
  },
  uniqueChords(modeChords, baseSet) {
    return modeChords.filter(c => !baseSet.has(c));
  }
};

const UI = {
  renderMainScale(root, scaleType) {
    const base = MusicConfig.BASE_SCALES[scaleType];
    const notes = Engine.scaleNotes(root, base.pattern);
    const chords = Engine.buildChords(root, base.pattern, base.qualities);
    const html = notes.map((note,i)=>`<div class="pill">${chords[i]}<small>${base.roman[i]}</small></div>`).join("");
    document.getElementById("mainScaleCard").innerHTML = `
      <div class="scale-header">
        <span>🎼 ${root} ${base.label}</span>
        <span>diatonic · parent scale</span>
      </div>
      <div class="diatonic-pills">${html}</div>
    `;
  },
  renderModes(root, scaleType) {
    const base = MusicConfig.BASE_SCALES[scaleType];
    const baseChords = new Set(Engine.buildChords(root, base.pattern, base.qualities));
    const modes = Modes[scaleType];
    let outside = new Set();
    
    // Calculate semitone offset from C for transposing chordMap chords
    const semitones = (MusicConfig.NOTES.indexOf(root) - MusicConfig.NOTES.indexOf("C") + 12) % 12;
    
    const html = modes.map(mode => {
      const scaleNotes = mode.getNotes ? mode.getNotes(root) : Engine.scaleNotes(root, mode.pattern);
      
      // Build chords for this mode
      let modeChords = [];
      if(mode.chordMap) {
        // For each chord in the chordMap at C, transpose to current root
        Object.values(mode.chordMap).forEach(chords => {
          chords.forEach(chord => {
            const transposedChord = transposeChord(chord, semitones);
            modeChords.push(transposedChord);
          });
        });
      } else if(mode.getChords) {
        modeChords = mode.getChords(root);
      } else {
        modeChords = Engine.buildChords(root, mode.pattern, mode.qualities);
      }

      // Remove duplicates
      modeChords = [...new Set(modeChords)];
      
      const unique = Engine.uniqueChords(modeChords, baseChords);
      unique.forEach(c=>outside.add(c));

      return `
      <div class="modal-card">
        <div class="modal-header">
          <span class="modal-name">${mode.name}</span>
          <span class="modal-desc">${mode.desc}</span>
        </div>
        <div class="scale-notes-row">
          ${scaleNotes.map(n=>`<span class="scale-note-badge">${n}</span>`).join("")}
        </div>
        <div class="chord-chips">
          ${unique.length ? unique.map(c=>`<span class="chip">${c}</span>`).join("") : "✨ all chords match parent"}
        </div>
        <div class="song-example">
          🎧 ${mode.song || "traditional reference"} — ${mode.detail || "modal colour"}
        </div>
      </div>
      `;
    }).join("");
    document.getElementById("modalGroupsContainer").innerHTML = html;
    document.getElementById("outsideCount").innerText = outside.size;
  }
};

function refreshUI() {
  const root = document.getElementById("rootSelect").value;
  const scaleType = document.getElementById("scaleSelect").value;
  UI.renderMainScale(root, scaleType);
  UI.renderModes(root, scaleType);
}

function initRootSelector() {
  const selector = document.getElementById("rootSelect");
  MusicConfig.NOTES.forEach(note=>{
    const option = document.createElement("option");
    option.value = note;
    option.textContent = note;
    if(note==="C") option.selected=true;
    selector.appendChild(option);
  });
}

initRootSelector();
document.getElementById("rootSelect").addEventListener("change", refreshUI);
document.getElementById("scaleSelect").addEventListener("change", refreshUI);
refreshUI();

})();

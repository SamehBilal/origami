/* Origami models and their step diagrams.
 * Every diagram is drawn on a 200 x 200 grid.
 * Paper sides:  front = coloured side, back = white side.
 * Lines:        valley = dashed (fold towards you), mountain = dash-dot (fold away).
 */
(function () {
  'use strict';

  // ---------- drawing helpers ----------
  const poly = (pts, cls = 'front') => `<polygon class="${cls}" points="${pts}"/>`;
  const line = (cls) => (x1, y1, x2, y2) =>
    `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const valley = line('valley');
  const mountain = line('mountain');
  const crease = line('crease');

  // Curved arrow from (x0,y0) through control (cx,cy) to (x1,y1), with a drawn head (no <marker> ids).
  function arrow(x0, y0, cx, cy, x1, y1, behind = false) {
    const dx = x1 - cx, dy = y1 - cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const s = 8, w = 4.2;
    const bx = x1 - ux * s, by = y1 - uy * s;
    const head = `${x1},${y1} ${(bx - uy * w).toFixed(1)},${(by + ux * w).toFixed(1)} ${(bx + uy * w).toFixed(1)},${(by - ux * w).toFixed(1)}`;
    return `<path class="arrow${behind ? ' behind' : ''}" d="M${x0} ${y0} Q${cx} ${cy} ${bx.toFixed(1)} ${by.toFixed(1)}"/><polygon class="head" points="${head}"/>`;
  }

  // "Turn the paper over" symbol.
  function flip(x = 176, y = 178, s = 1) {
    const a = arrow(-14, -2, 0, -16, 14, -2) + arrow(14, 4, 0, 18, -14, 4);
    return `<g aria-hidden="true" transform="translate(${x} ${y}) scale(${s})">${a}</g>`;
  }

  // "Repeat behind" note.
  const note = (x, y, t) => `<text class="label" x="${x}" y="${y}">${t}</text>`;

  const SQ = '20,20 180,20 180,180 20,180';
  const DIA = '100,20 180,100 100,180 20,100';

  // ---------- models ----------
  const models = [
    // ---------------------------------------------------------------- CUP
    {
      id: 'cup',
      name: 'Paper Cup',
      level: 'easy',
      paper: 'Square',
      blurb: 'A classic first model that actually holds water — for a little while.',
      steps: [
        {
          title: 'Make a triangle',
          text: 'Place the paper coloured side down, turned like a diamond. Fold the bottom corner up to meet the top corner.',
          svg: poly(DIA, 'back') + valley(20, 100, 180, 100) + arrow(100, 168, 140, 100, 100, 32)
        },
        {
          title: 'Fold the right corner across',
          text: 'Fold the right corner over so its tip touches the middle of the left edge.',
          tip: 'Try to keep the top edge of the flap level with the table.',
          svg: poly('20,140 180,140 100,60') + valley(113, 140, 130, 90) + arrow(174, 134, 128, 66, 64, 98)
        },
        {
          title: 'Fold the left corner across',
          text: 'Do the same with the left corner: fold it over the first flap so its tip touches the right edge.',
          svg: poly('20,140 113,140 130,90 100,60') + poly('113,140 130,90 60,100', 'front2') +
            valley(87, 140, 70, 90) + arrow(26, 134, 72, 66, 136, 98)
        },
        {
          title: 'Fold the front flap down',
          text: 'There are two loose flaps at the top. Fold the front one down over the cup and crease it well.',
          svg: poly('87,140 113,140 130,90 100,60 70,90') + poly('113,140 130,90 60,100', 'front2') +
            poly('87,140 70,90 140,100', 'front2') + poly('70,90 100,60 130,90') +
            valley(72, 92, 128, 92) + arrow(100, 66, 128, 84, 102, 116)
        },
        {
          title: 'Fold the back flap behind',
          text: 'Fold the other flap down behind the cup, the same way. The dashed arrow means "behind".',
          svg: poly('87,140 113,140 130,90 100,60 70,90') + poly('113,140 130,90 60,100', 'front2') +
            poly('87,140 70,90 140,100', 'front2') + poly('72,92 128,92 100,122', 'back') +
            mountain(72, 92, 128, 92) + arrow(100, 66, 72, 76, 96, 110, true)
        },
        {
          title: 'Open your cup',
          text: 'Gently squeeze the sides to open the pocket at the top. Your cup is ready!',
          svg: '<ellipse class="shadow" cx="100" cy="172" rx="40" ry="6"/>' +
            poly('40,80 160,80 125,165 75,165') + poly('40,80 160,80 100,125', 'back') +
            '<ellipse class="front2" cx="100" cy="80" rx="60" ry="7"/>'
        }
      ]
    },

    // ---------------------------------------------------------------- PLANE
    {
      id: 'dart',
      name: 'Dart Plane',
      level: 'easy',
      paper: 'Rectangle (A4 / Letter)',
      blurb: 'The fast, straight-flying paper airplane everyone should know.',
      steps: [
        {
          title: 'Crease the centre',
          text: 'Use a rectangle of paper, coloured side down. Fold it in half lengthwise, then unfold.',
          svg: poly('45,22 155,22 155,177 45,177', 'back') + valley(100, 22, 100, 177) +
            arrow(62, 110, 100, 72, 138, 110)
        },
        {
          title: 'Fold the top corners in',
          text: 'Fold both top corners down so their edges meet along the centre crease.',
          svg: poly('45,22 155,22 155,177 45,177', 'back') + crease(100, 22, 100, 177) +
            valley(100, 22, 45, 77) + valley(100, 22, 155, 77) +
            arrow(50, 28, 58, 66, 94, 72) + arrow(150, 28, 142, 66, 106, 72)
        },
        {
          title: 'Fold the edges in again',
          text: 'Fold the new slanted edges in to the centre crease once more, making a sharp point.',
          svg: poly('100,22 155,77 155,177 45,177 45,77', 'back') + poly('100,22 45,77 100,77') +
            poly('100,22 155,77 100,77') + crease(100, 77, 100, 177) +
            valley(100, 22, 45, 155) + valley(100, 22, 155, 155) +
            arrow(52, 118, 62, 96, 92, 112) + arrow(148, 118, 138, 96, 108, 112)
        },
        {
          title: 'Fold in half',
          text: 'Fold the plane in half along the centre crease, folding the left side behind the right.',
          svg: poly('100,22 155,155 155,177 45,177 45,155', 'back') + poly('100,22 100,100 45,155') +
            poly('100,22 100,100 155,155') + mountain(100, 22, 100, 177) +
            arrow(70, 168, 100, 196, 132, 168, true)
        },
        {
          title: 'Fold down the wings',
          text: 'Turn the plane so the point faces right. Fold the top layer down to make a wing, with the crease parallel to the bottom edge. Turn over and repeat.',
          svg: poly('180,140 47,85 25,85 25,140', 'back') + poly('180,140 47,85 60,120', 'front') +
            valley(25, 120, 131, 120) + arrow(36, 90, 14, 110, 36, 132) + note(118, 170, 'repeat behind')
        },
        {
          title: 'Open and fly',
          text: 'Lift the wings so they are level, making a slight "Y" shape from the front. Throw it gently and level!',
          svg: '<ellipse class="shadow" cx="100" cy="186" rx="60" ry="5"/>' +
            poly('100,18 172,168 104,158 100,178 96,158 28,168') + poly('100,18 104,158 100,178 96,158', 'front2')
        }
      ]
    },

    // ---------------------------------------------------------------- FORTUNE TELLER
    {
      id: 'fortune-teller',
      name: 'Fortune Teller',
      level: 'easy',
      paper: 'Square',
      blurb: 'The playground classic. Write fortunes under the flaps and play.',
      steps: [
        {
          title: 'Crease the diagonals',
          text: 'Start coloured side down. Fold the square in half along both diagonals, unfolding after each one.',
          svg: poly(SQ, 'back') + valley(20, 20, 180, 180) + valley(180, 20, 20, 180) +
            arrow(30, 172, 18, 110, 92, 108)
        },
        {
          title: 'Corners to the centre',
          text: 'Fold all four corners in so their tips meet exactly at the centre.',
          svg: poly(SQ, 'back') + crease(20, 20, 180, 180) + crease(180, 20, 20, 180) +
            valley(100, 20, 180, 100) + valley(180, 100, 100, 180) + valley(100, 180, 20, 100) + valley(20, 100, 100, 20) +
            arrow(26, 26, 46, 64, 88, 88) + arrow(174, 26, 136, 46, 112, 88) +
            arrow(174, 174, 154, 136, 112, 112) + arrow(26, 174, 64, 154, 88, 112)
        },
        {
          title: 'Turn it over',
          text: 'You now have a smaller square. Turn it over so the folded flaps are face down.',
          svg: poly('20,100 100,20 100,100') + poly('100,20 180,100 100,100') +
            poly('180,100 100,180 100,100') + poly('100,180 20,100 100,100') + flip()
        },
        {
          title: 'Corners to the centre again',
          text: 'Fold the four new corners into the centre, just like before.',
          svg: poly(DIA) + valley(60, 60, 140, 60) + valley(140, 60, 140, 140) + valley(140, 140, 60, 140) + valley(60, 140, 60, 60) +
            arrow(100, 26, 116, 52, 100, 92) + arrow(174, 100, 148, 116, 108, 100) +
            arrow(100, 174, 84, 148, 100, 108) + arrow(26, 100, 52, 84, 92, 100)
        },
        {
          title: 'Crease and open the pockets',
          text: 'Fold in half both ways and unfold. Write numbers on the flaps and fortunes underneath. Then turn over and slide your thumbs and fingers into the four pockets.',
          tip: 'Push the four corners together and up so the centre pops into a point.',
          svg: poly('40,40 160,40 160,160 40,160', 'back') +
            poly('40,40 160,40 100,100', 'back2') + poly('160,40 160,160 100,100', 'back') +
            poly('160,160 40,160 100,100', 'back2') + poly('40,160 40,40 100,100', 'back') +
            valley(100, 30, 100, 170) + valley(30, 100, 170, 100) +
            note(66, 76, '1') + note(128, 76, '2') + note(128, 132, '3') + note(66, 132, '4')
        },
        {
          title: 'Play!',
          text: 'Open and close the fortune teller in both directions as you count. Done!',
          svg: (function () {
            let s = '<ellipse class="shadow" cx="100" cy="182" rx="70" ry="6"/>';
            [[30, 30], [100, 30], [30, 100], [100, 100]].forEach(([x, y]) => {
              const cx = x + 35, cy = y + 35, X = x + 70, Y = y + 70;
              s += poly(`${x},${y} ${X},${y} ${cx},${cy}`) + poly(`${X},${y} ${X},${Y} ${cx},${cy}`, 'front2') +
                poly(`${X},${Y} ${x},${Y} ${cx},${cy}`) + poly(`${x},${Y} ${x},${y} ${cx},${cy}`, 'front2');
            });
            return s;
          })()
        }
      ]
    },

    // ---------------------------------------------------------------- PUPPY
    {
      id: 'puppy',
      name: 'Puppy Face',
      level: 'easy',
      paper: 'Square',
      blurb: 'Five folds and a pen — perfect for younger folders.',
      steps: [
        {
          title: 'Fold in half',
          text: 'Coloured side down, turned like a diamond. Fold the top corner down to meet the bottom corner.',
          svg: poly(DIA, 'back') + valley(20, 100, 180, 100) + arrow(100, 30, 142, 100, 100, 168)
        },
        {
          title: 'Make a centre crease',
          text: 'Fold the triangle in half from side to side, then unfold to leave a centre crease.',
          svg: poly('20,60 180,60 100,140') + valley(100, 60, 100, 140) + arrow(36, 70, 100, 30, 164, 70)
        },
        {
          title: 'Fold down the ears',
          text: 'Fold each side corner down at a slant so the tips hang below the top edge. These are the ears.',
          svg: poly('20,60 180,60 100,140') + crease(100, 60, 100, 140) +
            valley(70, 60, 35, 75) + valley(130, 60, 165, 75) +
            arrow(24, 56, 10, 76, 32, 94) + arrow(176, 56, 190, 76, 168, 94)
        },
        {
          title: 'Shape the nose and head',
          text: 'Fold the bottom tip up a little to make the nose. Fold the top edge behind to round off the head.',
          svg: poly('35,75 70,60 130,60 165,75 100,140') + poly('70,60 35,75 36,96', 'front2') +
            poly('130,60 165,75 164,96', 'front2') +
            valley(85, 125, 115, 125) + arrow(100, 136, 120, 128, 102, 112) + mountain(72, 68, 128, 68)
        },
        {
          title: 'Draw the face',
          text: 'Draw on eyes and colour in the nose. Woof!',
          svg: '<ellipse class="shadow" cx="100" cy="172" rx="50" ry="6"/>' +
            poly('35,78 70,68 130,68 165,78 115,125 85,125') + poly('85,125 115,125 100,112', 'back') +
            poly('70,68 35,78 30,124', 'front2') + poly('130,68 165,78 170,124', 'front2') +
            '<circle class="ink" cx="82" cy="92" r="5"/><circle class="ink" cx="118" cy="92" r="5"/>' +
            '<ellipse class="ink" cx="100" cy="116" rx="7" ry="5"/>'
        }
      ]
    },

    // ---------------------------------------------------------------- TULIP
    {
      id: 'tulip',
      name: 'Tulip',
      level: 'easy',
      paper: 'Square',
      blurb: 'A simple flower head. Make a bunch in different colours.',
      steps: [
        {
          title: 'Make a triangle',
          text: 'Coloured side down, turned like a diamond. Fold the bottom corner up to the top corner.',
          svg: poly(DIA, 'back') + valley(20, 100, 180, 100) + arrow(100, 168, 60, 100, 100, 32)
        },
        {
          title: 'Fold the right corner up',
          text: 'Fold the right corner up along a line from the middle of the bottom edge, so its tip points up just to the right of the top.',
          svg: poly('20,140 180,140 100,60') + valley(100, 140, 145, 105) + arrow(176, 134, 180, 76, 124, 64)
        },
        {
          title: 'Fold the left corner up',
          text: 'Repeat on the left side, so both tips stand up like petals.',
          svg: poly('20,140 100,140 145,105 100,60') + poly('100,140 145,105 120,62', 'front2') +
            valley(100, 140, 55, 105) + arrow(24, 134, 20, 76, 76, 64)
        },
        {
          title: 'Round off the sides',
          text: 'Turn the paper over. Fold the small left and right corners behind to round off the flower.',
          svg: poly('55,105 100,140 145,105 100,60') + poly('100,140 145,105 120,62', 'front2') +
            poly('100,140 55,105 80,62', 'front2') +
            mountain(64, 92, 72, 120) + mountain(136, 92, 128, 120) +
            arrow(52, 104, 40, 118, 62, 126, true) + arrow(148, 104, 160, 118, 138, 126, true)
        },
        {
          title: 'Add a stem',
          text: 'Your tulip is finished. Glue it to a card or a paper stem to make a flower.',
          svg: '<path class="stem" d="M100 132 C100 160 98 175 100 192"/>' +
            '<path class="leaf" d="M100 182 C80 178 66 160 64 146 C84 150 96 164 100 182Z"/>' +
            poly('70,98 80,52 100,80 120,52 130,98 100,138') + poly('100,80 114,96 100,138 86,96', 'front2')
        }
      ]
    },

    // ---------------------------------------------------------------- CRANE
    {
      id: 'crane',
      name: 'Crane',
      level: 'medium',
      paper: 'Square',
      blurb: 'The best-known origami model, a symbol of peace and good luck.',
      steps: [
        {
          title: 'Crease the diagonals',
          text: 'Start coloured side up. Fold in half along both diagonals, unfolding each time.',
          svg: poly(SQ) + valley(20, 20, 180, 180) + valley(180, 20, 20, 180) + arrow(30, 172, 18, 110, 92, 108)
        },
        {
          title: 'Turn over, crease in half',
          text: 'Turn the paper over (white side up). Fold it in half side-to-side, then top-to-bottom, unfolding each time.',
          svg: poly(SQ, 'back') + mountain(20, 20, 180, 180) + mountain(180, 20, 20, 180) +
            valley(100, 20, 100, 180) + valley(20, 100, 180, 100) + flip(190, 189, 0.6)
        },
        {
          title: 'Collapse into a square base',
          text: 'Turn the paper like a diamond. Bring the left, right and top corners down to the bottom corner, letting the paper collapse along the creases into a small square.',
          svg: poly(DIA, 'back') + mountain(20, 100, 180, 100) + mountain(100, 20, 100, 180) +
            valley(60, 60, 140, 140) + valley(140, 60, 60, 140) +
            arrow(28, 104, 46, 150, 92, 172) + arrow(172, 104, 154, 150, 108, 172) +
            arrow(108, 26, 138, 100, 104, 162, true)
        },
        {
          title: 'Kite fold',
          text: 'Square base: open end at the bottom. Fold the lower edges of the front layer in to lie along the centre line.',
          svg: poly('100,30 170,100 100,170 30,100') + crease(100, 30, 100, 170) +
            valley(100, 170, 59, 71) + valley(100, 170, 141, 71) +
            arrow(36, 102, 58, 132, 94, 112) + arrow(164, 102, 142, 132, 106, 112)
        },
        {
          title: 'Fold the top down, then unfold',
          text: 'Fold the top triangle down over the flaps and crease hard. Then unfold this fold and the two flaps.',
          svg: poly('100,30 170,100 100,170 30,100') + poly('59,71 100,170 100,71', 'front2') +
            poly('141,71 100,170 100,71', 'front2') + valley(59, 71, 141, 71) + arrow(100, 38, 132, 60, 102, 96)
        },
        {
          title: 'Petal fold',
          text: 'Lift the bottom corner of the front layer up along the horizontal crease. The sides fold in along the creases you just made. Flatten into a long diamond.',
          tip: 'This is the trickiest step — go slowly and let the creases guide the paper.',
          svg: poly('100,30 170,100 100,170 30,100') + crease(100, 30, 100, 71) +
            valley(59, 71, 141, 71) + mountain(100, 170, 59, 71) + mountain(100, 170, 141, 71) +
            arrow(100, 162, 160, 90, 102, 14)
        },
        {
          title: 'Repeat on the back',
          text: 'Turn over and repeat the kite fold, the fold-and-unfold and the petal fold on this side. This shape is the bird base.',
          svg: poly('100,54 156,110 100,166 44,110', 'front2') + poly('100,8 133,87 100,166 67,87') +
            crease(100, 8, 100, 87) + flip(178, 182)
        },
        {
          title: 'Narrow the legs',
          text: 'The bottom splits into two "legs". Fold the lower edges of the front layer in to the centre line. Turn over and repeat.',
          svg: poly('100,16 135,100 100,184 65,100') + crease(100, 100, 100, 184) +
            valley(100, 184, 83, 100) + valley(100, 184, 117, 100) +
            arrow(70, 108, 76, 136, 96, 132) + arrow(130, 108, 124, 136, 104, 132) + note(122, 170, 'repeat behind')
        },
        {
          title: 'Make the neck and tail',
          text: 'Inside-reverse-fold each thin leg up between the layers of the body: one for the neck, one for the tail.',
          tip: 'Open the layers a little, push the point up inside along the crease, then close.',
          svg: poly('100,16 135,100 117,100 100,184 83,100 65,100') + crease(100, 100, 100, 184) +
            valley(83, 100, 100, 124) + valley(117, 100, 100, 124) +
            arrow(94, 176, 30, 160, 42, 48) + arrow(106, 176, 170, 160, 158, 48)
        },
        {
          title: 'Make the head',
          text: 'Inside-reverse-fold the tip of the neck down to make the head.',
          svg: poly('122,105 102,125 165,22', 'front2') + poly('78,105 98,125 35,22', 'front2') +
            poly('100,16 135,100 100,130 65,100') +
            valley(38, 42, 50, 36) + arrow(34, 24, 18, 40, 36, 56)
        },
        {
          title: 'Spread the wings',
          text: 'Fold the wings down on both sides. Hold the base of the neck and tail and gently pull apart to shape the body. Your crane is finished!',
          svg: '<ellipse class="shadow" cx="100" cy="178" rx="64" ry="6"/>' +
            poly('96,124 146,28 118,124', 'front2') +
            poly('84,128 98,136 42,56') + poly('42,56 54,54 34,76') +
            poly('116,128 102,136 172,58') +
            poly('80,126 120,126 100,150', 'front2') +
            poly('88,128 52,34 112,128')
        }
      ]
    }
  ];

  // Legend entries (shown in the "Fold symbols" panel).
  const legend = [
    { label: 'Valley fold — fold towards you', svg: valley(4, 14, 52, 14) },
    { label: 'Mountain fold — fold away from you', svg: mountain(4, 14, 52, 14) },
    { label: 'Existing crease', svg: crease(4, 14, 52, 14) },
    { label: 'Fold in this direction', svg: arrow(6, 20, 28, -4, 50, 20) },
    { label: 'Fold behind', svg: arrow(6, 20, 28, -4, 50, 20, true) },
    { label: 'Coloured side', svg: '<rect class="front" x="10" y="4" width="36" height="20"/>' },
    { label: 'White side', svg: '<rect class="back" x="10" y="4" width="36" height="20"/>' },
    { label: 'Turn the paper over', svg: '<g transform="translate(28 14) scale(.75) translate(-176 -178)">' + flip(176, 178) + '</g>' }
  ];

  window.ORIGAMI = { models, legend };
})();

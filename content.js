/*

map of `e.which` values (as the keys) and the keyboard numbers they represent

48: 0
49: 1
50: 2
...
57: 9

*/

let cKey = 67;
let shiftKey = 16;
let numberVals = [49, 50, 51, 52, 53, 54, 55, 56, 57];

let keysCurrentlyPressedDown = {};
let copyButtonsVisible = [];

function assignButtonTexts(buttonIDs) {
  buttonIDs.forEach((id, i) => {
    let button = document.getElementById(id);
    button.innerHTML = `<p>Copy!<br/>(Shift+C+${i + 1})</p>`
  });
}

document.onkeydown = function(e) {
  keysCurrentlyPressedDown[e.which] = true;
  let pressedDownKeys = Object.keys(keysCurrentlyPressedDown).filter(k => keysCurrentlyPressedDown[k]);
  numberVals.forEach((val, i) => {
    if (keysCurrentlyPressedDown[shiftKey]
        && keysCurrentlyPressedDown[cKey]
        && e.which === val) {
      console.log('shortcut activated for currently visible copy button #' + i);
      if (i < copyButtonsVisible.length) {
        let buttonToClick = document.getElementById(copyButtonsVisible[i]);
        buttonToClick.click();
      }
    }
  });
}

document.onkeyup = function(e) {
  keysCurrentlyPressedDown[e.which] = false;
  console.log('e.which is: ' + e.which);
};

let observer = new IntersectionObserver((entry, observer) => {
  if (entry[0] && entry[0].isIntersecting) {
    copyButtonsVisible.push(entry[0].target.id);
  } else if (entry[0] && !entry[0].isIntersecting && copyButtonsVisible.includes(entry[0].target.id)) {
    var index = copyButtonsVisible.indexOf(entry[0].target.id);
    copyButtonsVisible.splice(index, 1);
  }
  copyButtonsVisible.sort();
  assignButtonTexts(copyButtonsVisible);
  console.log('copyButtonsVisible is now: ' + copyButtonsVisible);
});

function copyTextOnClick(elem, copyButton) {
  return () => {
    window.getSelection().removeAllRanges();
    var range = document.createRange();
    range.selectNode(elem);
    window.getSelection().addRange(range);
    try {
      var successful = document.execCommand('copy');
      var original = copyButton.innerText;
      copyButton.innerText = 'Copied!';
      setTimeout(() => {
        copyButton.innerText = original;
      }, 1000);
    } catch (error) {
      console.log('Houston, we have a problem. We were unable to copy');
      alert('something blew up! elem.nodeName was ' + elem.nodeName);
    }
  };
}

function copyListener(e) {
  e.preventDefault();
  let lines = this.innerText.split('\n');
  let data = this.innerText
  if (lines.length === 2 && lines[1] === '') {
    let words = lines[0].split(' ');
    data = words[0] === '$' ? words.slice(1).join(' ') : lines[0];
  }

  if (e.clipboardData) {
    e.clipboardData.setData('text/plain', data);
  } else if (window.clipboardData) {
    window.clipboardData.setData('Text', data);
  }
  window.getSelection().removeAllRanges();
}

var snippets = document.getElementsByTagName('pre');
for (var i = 0, l = snippets.length; i < l; i++) {
  let parentNode = snippets[i].parentNode;
  let mainSectionDivChild = parentNode.nodeName === 'DIV' && parentNode.className !== 'commit-desc';
  let mainSectionArticleChild = parentNode.nodeName === 'ARTICLE';
  if (mainSectionDivChild || mainSectionArticleChild) {
    let nodeToApplyTheStylesTo = mainSectionArticleChild ? snippets[i] : parentNode;
    let nodeToApplyFlex1To = mainSectionArticleChild ? snippets[i].firstChild : snippets[i];
    nodeToApplyTheStylesTo.style = 'display: flex; min-width: 100%;';
    nodeToApplyFlex1To.style = 'flex: 1;';
    let copyButton = document.createElement('button');
    copyButton.id = 'copyButton #' + i;
    copyButton.style = 'max-height: 50px;'
    copyButton.innerText = 'Copy!'
    copyButton.onclick = copyTextOnClick(nodeToApplyFlex1To, copyButton);
    nodeToApplyFlex1To.addEventListener('copy', copyListener);
    if (!mainSectionArticleChild) {
      parentNode.appendChild(copyButton);
    } else {
      snippets[i].appendChild(copyButton);
    }
    observer.observe(copyButton);
  }
}
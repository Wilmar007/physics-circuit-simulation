const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = __dirname;
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + htmlPath,
  virtualConsole
});

const { window } = dom;

function dumpState(tag){
  try{
    console.log(tag, 'electricityLabLocks=', window.localStorage.getItem('electricityLabLocks'));
    console.log(tag, 'EL_QUIZ_PASSED=', window.localStorage.getItem('EL_QUIZ_PASSED'));
    if(typeof window.getLocks === 'function'){
      try{ console.log(tag, 'getLocks()', JSON.stringify(window.getLocks())); }catch(e){ console.log('getLocks error',e); }
    }
  }catch(e){ console.error('dump error',e); }
}

console.log('Waiting for DOM load...');
window.addEventListener('load', () => {
  console.log('DOM loaded');
  // wait shortly for scripts to initialize
  setTimeout(() => {
    dumpState('before');
    console.log('Posting QUIZ_PASSED {topic: "parallel"}');
    window.postMessage({ type: 'QUIZ_PASSED', topic: 'parallel' }, '*');
    // allow handlers to run
    setTimeout(() => {
      dumpState('after');
      process.exit(0);
    }, 1500);
  }, 1500);
});

// fallback timeout
setTimeout(() => {
  console.error('Timed out waiting for load');
  dumpState('timeout');
  process.exit(2);
}, 30000);

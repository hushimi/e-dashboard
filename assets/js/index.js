const shell= require('electron').shell;
const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const { Terminal } = require("xterm");
const { FitAddon } = require("xterm-addon-fit");
window.$ = window.jQuery = require('jquery');

const term = new Terminal({
    cursorBlink: true,
    RendererType: 'canvas',
    cols: 100,
    rows: 1000,
    allowTransparency: true,
    fontFamily: 'Hack',
    fontSize: 12
});

let strBuffer = [];
let keyEnter = '';
let pop_flg = false;
let fitAddon = new FitAddon();


// --------------------------------------------
// Jquery window load
// --------------------------------------------
$(function () {
    $('#shell-name').html(remote.getGlobal('shareObj').shellName);
    pop();

    // --------------------------------------------
    // add event listener
    // --------------------------------------------
    $('#close-button').on('click', () => {
        $('#term-container').css('display', 'none');
        $('#app-container').css('height', '98%');
    });

    $('#item1').on('click', () => {
        $('#app-container').load('views/code.html #cmd-dict');
    });

    $('#item2').on('click', () => {
        $('#term-container').css('display', 'block');
        $('#term-container').css('height', '35%');
        $('#app-container').css('height', '63%');
        fitAddon.fit();
        term.focus();

    });

    $('#item3').on('click', () => {
        $('#app-container').load('views/links.html #file-links');
    });

    $('#item4').on('click', () => {
        $('#app-container').load('views/task.html #task-list');
    });


    // --------------------------------------------
    // terminal setting
    // --------------------------------------------
    el = $('#drag');
    dragElement(el);

    term.loadAddon(fitAddon);
    term.open(document.getElementById('terminal'));
    fitAddon.fit();
    term.setOption('theme', {
        background: '#0000001A',
    });

    term.write('Hello Friend');
    ipc.send('terminal.toTerm', String.fromCharCode(3));
    term.focus();
});

// --------------------------------------------
// electron event handler
// --------------------------------------------
term.onData(e => {
    console.log(e.charCodeAt(0));

    if(e.charCodeAt(0) == 27) {
        strBuffer = [];

    } else if (e.charCodeAt(0) !== 13) {
        strBuffer.push(e);

    } else if(e.charCodeAt(0) === 13) {
        keyEnter = strBuffer.join('');

        strBuffer = [];
        if (keyEnter === 'exit') {
            term.reset();
            ipc.send('terminal.toTerm', String.fromCharCode(3));

            $('#term-container').css('display', 'none');
            $('#app-container').css('height', '98%');
            return;
        } else if(keyEnter.includes('vim ')) {
            ipc.send('terminal.toTerm', String.fromCharCode(3));
            alert('sorry, can not use terminal editor...');
            term.reset();

        }

    }

    ipc.send('terminal.toTerm', e);
});

ipc.on('terminal.incData', function(event, data) {
    term.write(data);
});



/**
 * --------------------------------------------------------
 * add event listener to draggable element
 * - closure function
 *
 * @param object el
 * --------------------------------------------------------
 */
function dragElement(el) {
    let pos1 = 0, pos2 = 0;
    let appBox = $('#app-container');
    let termBox = $('#term-container');

    el.on('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos2 = e.clientY;
        document.onmouseup = closeDragElement;

        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position:
        pos1 = pos2 - e.clientY;
        pos2 = e.clientY;

        // set the element's new height
        termBox.height(termBox.height() + pos1 + "px");
        appBox.height(appBox.height() - pos1 + "px");
        fitAddon.fit();
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * --------------------------------------------------------
 * pop out circular menu
 *
 * --------------------------------------------------------
 */
function pop() {
    if (!pop_flg) {
        $('#item1').css('transform', 'translateX(-65px)');
        $('#item2').css('transform', 'translateX(65px)');
        $('#item3').css('transform', 'translateY(65px)');
        $('#item4').css('transform', 'translateY(-65px)');
        pop_flg = true;
    } else {
        $('#item1').css('transform', 'translateY(0)');
        $('#item2').css('transform', 'translateY(0)');
        $('#item3').css('transform', 'translateY(0)');
        $('#item4').css('transform', 'translateY(0)');
        pop_flg = false;
    }
}
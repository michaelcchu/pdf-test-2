const canvas = document.getElementById('layer1');
const context = canvas.getContext('2d', {willReadFrequently: true});

var loadingTask = pdfjsLib.getDocument('IMSLP23765-PMLP01595-Beethoven_Symphony6_Cls.pdf');
loadingTask.promise.then(function(pdf) {
  // you can now use *pdf* here
  pdf.getPage(1).then(function(page) {
    // you can now use *page* here
    var scale = 1;
    var viewport = page.getViewport({ scale: scale, });
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    var transform = outputScale !== 1
    ? [outputScale, 0, 0, outputScale, 0, 0]
    : null;

    var renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport
    };

    var renderingTask = page.render(renderContext);

    renderingTask.promise.then(function() {
        initializeCanvases(); 
        const cursor = createCursor();

        const lines = getHorizontalLines();
        console.log(lines);
        drawLines(lines);

        lines_index = -1;
        document.addEventListener("keydown", () => {
            cursor.clear();
            lines_index++;
            cursor.x = lines[lines_index][0] % canvas.width;
            cursor.y = Math.floor(lines[lines_index][0] / canvas.width);
            cursor.update();
        });

        const verticalLines = getVerticalLines();
        console.log(verticalLines);
        drawLines(verticalLines,5,false,'layer3');
    });
  });
});



function initializeCanvases() {
    for (let i=2; i<=4; i++) {
        const canvas = document.getElementById('layer'+i);
        canvas.width = document.getElementById('layer1').width;
        canvas.height = document.getElementById('layer1').height;
    }
}

function createCursor() {
    const canvas = document.getElementById('layer4');
    const context = canvas.getContext('2d');
    context.globalAlpha = 0.5;
    
    function component(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.clear = function() {
            context.clearRect(this.x, this.y, this.width, this.height);
        };
        this.update = function() {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        };
    }
    
    const cursor = new component(0, 0, 10, 50, "red");
    cursor.update();
    return cursor;
}

function getHorizontalLines() {
    const canvas = document.getElementById('layer1');
    const context = canvas.getContext('2d', {willReadFrequently: true});

    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const lines = [];

    let line = [];
    for (let i = 0; 4*i < data.length; i++) {
        if ((data[4*i] !== 255) || 
        (data[4*i+1] !== 255) || 
        (data[4*i+2] !== 255)) {
            line.push(i);
        } else {
            if (line.length) {
                lines.push(line);
                line = [];
            }
        }
    }

    return lines;
}

function getVerticalLines() {
    const canvas = document.getElementById('layer1');
    const context = canvas.getContext('2d', {willReadFrequently: true});

    const w = canvas.width;
    const h = canvas.height;

    const imgData = context.getImageData(0, 0, w, h);
    const data = imgData.data;
    const lines = [];

    let line = [];
    for (let i = 0; 4*i < data.length; i++) {
        const j = Math.floor(i / h) + (i % h) * w
        if ((data[4*j] !== 255) || 
        (data[4*j+1] !== 255) || 
        (data[4*j+2] !== 255)) {
            line.push(j);
        } else {
            if (line.length) {
                lines.push(line);
                line = [];
            }
        }
    }

    return lines;
}

function drawLines(lines, minLength=100, horizontal=true, layer='layer2') {
    const canvas = document.getElementById(layer);
    const context = canvas.getContext('2d', {willReadFrequently: true});

    const w = canvas.width;
    const h = canvas.height;

    const imgData = context.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (line of lines) {
        if (line.length >= minLength) {
            for (i of line) {
                if (horizontal) {
                    data[4*i] = 0;
                    data[4*i+1] = 255;
                    data[4*i+2] = 0;
                    data[4*i+3] = 127;
                } else {
                    data[4*i] = 0;
                    data[4*i+1] = 0;
                    data[4*i+2] = 255;
                    data[4*i+3] = 127;
                }

            }
        }
    }

    context.putImageData(imgData, 0, 0);
}
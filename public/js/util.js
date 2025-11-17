// (height, width)
export function createArray(length) {
  let arr = new Array(length || 0);
  let i = length;

  if (arguments.length > 1) {
    let args = Array.prototype.slice.call(arguments, 1);
    while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }

  return arr;
}

function matrixMapImpl(matrix, fn, ...indices) {
  if (!Array.isArray(matrix)) {
    return fn(matrix, ...indices);
  } else {
    return matrix.map((elem, index) => {
      return matrixMapImpl(elem, fn, ...indices, index);
    });
  }
}

export function matrixMap(matrix, fn) {
  return matrixMapImpl(matrix, fn);
}

export function transpose(matrix) {
  const cols = matrix.length;
  const rows = matrix[0].length;
  const result = createArray(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[r][c] = matrix[c][r];
    }
  }

  return result;
}

export function toGrayscaleMatrix(img) {
  const matrix = createArray(img.height, img.width);
  
  const _toGrayscale = (img, x, y) => {
    const i = x + img.width * y;
    const [r, g, b, a] = img.data.slice(4 * i, 4 * i + 4);

    return (a / 255) * (r + g + b) / 3;
  }

  for (let r = 0; r < img.height; r++) {
    for (let c = 0; c < img.width; c++) {
      matrix[r][c] = _toGrayscale(img, c, r) / 255;
    }
  }

  return matrix;
}

export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    return await response.json();
  }
}

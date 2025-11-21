export class PortSelectionCancelled extends Error {
  constructor() {
    super('User cancelled port selection.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

export class PortUnavailable extends Error {
  constructor() {
    super('Selected port already in use.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

export async function getPort() {
  try {
    const port = await navigator.serial.requestPort();
    const { usbProductId, usbVendorId } = port;
    console.log('Selected port:', port);
    if (usbProductId && usbVendorId) {
      console.log(`VID:PID ${usbVendorId}:${usbProductId}`);
    }
    return port;
  } catch (e) {
    if (e.name == 'NotFoundError') {
      throw new PortSelectionCancelled();
    } else if (e.name == 'InvalidStateError') {
      throw new PortUnavailable();
    } else {
      throw e;
    }
  }
}

export async function close(port) {
  try {
    await port.close();
  } catch(e) {
    if (e.name != 'InvalidStateError') {
      if (e.message != "Failed to execute 'close' on 'SerialPort': The port is already closed.") {
        throw e;
      }
    }
  }
}

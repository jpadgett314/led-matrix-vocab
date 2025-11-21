import { PortMutex } from './environments/web/PortMutex.js';
import { PortOperations } from './environments/web/PortOperations.js';
import { close, getPort } from './environments/web/ports.js';
import { CommandAbstractionLayer as DefaultController } from './firmware/framework-official/CommandAbstractionLayer.js';
import { CommandAbstractionLayer as SigrootController } from './firmware/sigroot/CommandAbstractionLayer.js';

export class SerialControllerFactory {
  static async make(environment, firmware) {
    if (environment === 'web') {
      const port = await getPort();
      if (port) {
        if (firmware === 'framework-official') {
          return await SerialControllerFactory.makeDefaultWebController(port);
        } else if (firmware === 'sigroot') {
          return await SerialControllerFactory.makeSigrootWebController(port);
        } else if (firmware === 'auto') {
          return await SerialControllerFactory.makeAutoWebController(port);
        } else {
          throw new Error(`Unsupported firmware type: ${firmware}`);
        }
      } else {
        return null;
      }
    } else {
      throw new Error(`Unsupported environment: ${environment}`);
    }
  }

  static async makeDefaultWebController(port) {
    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      return new DefaultController(
        new PortMutex(
          new PortOperations(port)
        )
      );
    }
  }

  static async makeSigrootWebController(port) {
    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      return new SigrootController(
        new PortMutex(
          new PortOperations(port)
        )
      );
    }
  }

  static async makeAutoWebController(port) {
    const ctrl1 = await this.makeDefaultWebController(port);
    if (await ctrl1.verifyFirmware()) {
      return ctrl1;
    }
    const ctrl2 = await this.makeSigrootWebController(port);
    if (await ctrl2.verifyFirmware()) {
      return ctrl2;
    }
  }
}

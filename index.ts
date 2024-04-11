import fetch from 'cross-fetch';

import { DOMParser } from '@xmldom/xmldom';

class Dymo {
  constructor() { }

  static get url() {
    return 'https://127.0.0.1:41951/DYMO/DLS/Printing';
  }

  static async getPrinters() {
    try {
      const response = await fetch(`${this.url}/GetPrinters`);
      const data = await response.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data, 'text/xml');
      const names = xml.getElementsByTagName('Name');
      const models = xml.getElementsByTagName('ModelName');
      const connections = xml.getElementsByTagName('IsConnected');

      let result = [];
      for (let i = 0; i < names.length; i++) {
        result.push({
          name: names[i].childNodes[0].nodeValue,
          model: models[i].childNodes[0].nodeValue,
          connected: connections[i].childNodes[0].nodeValue === 'True' ? true : false,
        });
      }
      return { success: true, data: result };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static async renderLabel(xml: string) {
    try {
      const body = `labelXml=${xml}`;
      const response = await fetch(`${this.url}/RenderLabel`, {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = await response.text();
      const result = 'data:image/png;base64,' + data.slice(1, -1);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static async printLabel(printer: string, xml: string, parameters: LabelParameters) {
    try {
      const params = this.createLabelParameters(parameters);
      const body = `printerName=${printer}&labelXml=${xml}&printParamsXml=${params}`;
      const response = await fetch(`${this.url}/PrintLabel`, {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.text();
      if (result !== 'true') return { success: false, data: result };

      return { success: true };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static createLabelParameters(parameters: LabelParameters): string {
    let xmlParameters = '<LabelWriterPrintParams>';

    if (parameters.copies && parameters.copies > 1)
      xmlParameters += `<Copies>${parameters.copies}</Copies>`;

    if (parameters?.jobTitle)
      xmlParameters += `<JobTitle>${parameters.jobTitle}</JobTitle>`;

    if (parameters?.flowDirection)
      xmlParameters += `<FlowDirection>${parameters.jobTitle}</FlowDirection>`;

    if (parameters?.printQuality)
      xmlParameters += `<PrintQuality>${parameters.printQuality}</PrintQuality>`;

    if (parameters?.twinTurboRoll)
      xmlParameters += `<TwinTurboRoll>${parameters.twinTurboRoll}</TwinTurboRoll>`;

    xmlParameters += '</LabelWriterPrintParams>';

    return xmlParameters;
  }

}

type LabelParameters = {
  copies: number | null;
  jobTitle: string | null;
  flowDirection: 'LeftToRight' | 'RightToLeft' | null;
  printQuality: 'Text' | 'BarcodeAndGraphics' | 'Auto' | null;
  twinTurboRoll: 'Left' | 'Right' | 'Auto' | null;
};

export default Dymo;
export { LabelParameters };

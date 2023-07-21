// @ts-nocheck

import { Duplex } from "jaculus-tools/dist/src/link/stream";
import { Buffer } from "buffer";


class WebSerialError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "WebSerialError";
    }
  }


export class WebSerialStream implements Duplex {
    private callbacks: {
        "data"?: (data: Buffer) => void,
        "error"?: (err: any) => void,
        "end"?: () => void
    } = {};

    private port: SerialPort;
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private writer: WritableStreamDefaultWriter<Uint8Array> ;

    constructor(port: SerialPort) {
        this.port = port;

        const reader = this.port.readable?.getReader();
        if (!reader)
            throw new WebSerialError("Cannot open reader");

        const writer = this.port.writable?.getWriter();
        if (!writer)
            throw new WebSerialError("Cannot open writer");

        this.reader = reader;
        this.writer = writer;

        const self = this;
        const readRoutine = async () => {
            try {
                while (true) {
                    const { value, done } = await self.reader.read();
                    if (done) {
                        self.reader.releaseLock();
                        if (self.callbacks["end"])
                            self.callbacks["end"]();
                        break;
                    } else {
                        if (self.callbacks["data"])
                            self.callbacks["data"](Buffer.from(value));
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        readRoutine();
    }

    public put(c: number): void {
        this.writer.write(Buffer.from([c]));
    }

    public write(buf: Buffer): void {
        const bufCopy = Buffer.from(buf);
        this.writer.write(bufCopy);
    }

    public onData(callback?: (data: Buffer) => void): void {
        this.callbacks["data"] = callback;
    }

    public onEnd(callback?: () => void): void {
        this.callbacks["end"] = callback;
    }

    public onError(callback?: (err: any) => void): void {
        this.callbacks["error"] = callback;
    }

    public destroy(): Promise<void> {
        // TBA: Check API doc
        // if (this.port.state === "closed") {
        //     return Promise.resolve();
        // }

        return new Promise((resolve, reject) => {
            if (this.callbacks["end"]) {
                const end = this.callbacks["end"];
                this.callbacks["end"] = () => {
                    end();
                    resolve();
                };
            }
            else {
                this.callbacks["end"] = () => {
                    resolve();
                };
            }
            if (this.callbacks["error"]) {
                const error = this.callbacks["error"];
                this.callbacks["error"] = (err: any) => {
                    error(err);
                    reject(err);
                };
            }
            else {
                this.callbacks["error"] = (err: any) => {
                    reject(err);
                };
            }

            (async () => {
                await this.reader.cancel();
                await this.writer.abort();
                await this.port.close();
            })
        });
    }
};

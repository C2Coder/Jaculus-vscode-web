import { SmartLed, LED_WS2812 } from "smartled";
import * as colors from "./libs/colors.js"
import * as gpio from "gpio";
import { stdout } from "stdio";
import * as adc from "adc";
import * as readline from "./libs/readline.js"
import * as servo from "./libs/servo.js"

async function main() {
    while (true) {
        
        console.log("hi")
        await sleep(1000)
    }
}

//main()


adc.configure(2);
const servo_0 = new servo.Servo(40, 1, 3);

setInterval(() => {
    let value = adc.read(2);
    console.log(value);
    servo_0.write(value);
}, 25);
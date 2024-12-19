# Jaculus-vscode-web

A web vscode extension for working with [Jaculus](https://jaculus.org) devices

## Links

[Jaculus homepage](https://jaculus.org/)

[Jaculus Library repository](https://c2coder.github.io/Jaculus-libraries/) ([GitHub](https://github.com/C2Coder/Jaculus-libraries))

[Jaculus Library Manager](https://github.com/C2Coder/Jaculus-library-manager)

[JacLy (Blocky enviroment)](https://c2coder.github.io/JacLy/)

## Command pallete

A list of all commands possible

`Jaculus: Select Port` - Open port selection windows <br>

`Jaculus: Connect & Disconnect` - Connect/Disconect from Jaculus device <br>

`Jaculus: List Devices` - Lists all devices accesible from the extension (allowed in port selection menu) <br>

`Jaculus: Build` - Compiles TypeScript code to JavaScript \*<br>

`Jaculus: Flash` - Flashes the JavaScript code to the device \*<br>

`Jaculus: Monitor & Stop Monitor` - Starts/Stops monitoring <br>

`Jaculus: Build FLash Monitor` - Builds the code, Flashes it to the device, opens monitoring \*<br>

`Jaculus-dosc: Open Installer` - Opens [Jaculus web installer](https://installer.jaculus.org) <br>

`Jaculus-dosc: Open Getting Started` - Opens [Getting Started documentation](https://jaculus.org/getting-started) <br>

`Jaculus-libs: Install Library` - Installs libraries from [Jaculus library repository](https://c2coder.github.io/Jaculus-libraries) \*<br>

`Jaculus-libs: Get Library Example` - Gets examples also from [Jaculus library repository](https://c2coder.github.io/Jaculus-libraries) \*<br>

\* asks for folder, use the root folder with the `tsconfig.json` file (mayby not needed in the future)


## DEV

Install
```bash
npm install
```

Run 
```bash
npm run watch 
```

And in second terminal run 
```bash
npm run browser 
```
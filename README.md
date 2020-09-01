# homebridge-raspberrypi-switch
This is Raspberry Pi Remote plugin for [Homebridge](https://github.com/nfarina/homebridge). 



### Features
* Shutdown or reboot Raspberry Pi through homekit button.



### Installation
1. Install required packages.

   ```
   cd project-dir | npm install -g
   ```

2. Check the OS of Raspberry Pi.

3. Add these values to `config.json`.

    ```
      "accessories": [
        {
          "accessory": "pi_switch",
          "name": "Raspberry Pi",
          "os": "linux",
          "serial": "123-456-789"
        }
      ]
    ```

4. Restart Homebridge, and your Raspberry Pi will be added to Home app.


# Credits
[clauzewitz](https://github.com/clauzewitz/homebridge-raspberrypi-remote) for main body.
[bachandi](https://github.com/bachandi/homebridge-raspberrypi-info/tree/fixes)for get_Model() function.

# License
MIT License

# TeamSpeak Webhookify Plugin
Webhookify plugin to control a TeamSpeak client via the ClientQuery API

## Installation

Install the plugin globally by running

	npm i -g whfp-teamspeak

## Configuration

The plugin only takes a single configuration key, which is called "apikey".

Example:
```json
{
	"apikey": "A1B2-C3D4-E5F6-G7H8-I9J1-0K11L"
}
```

This API key can be retrieved from the settings, by going to the Addons and opening the settings of the ClientQuery addon:

![Teamspeak Addon Settings](https://i.imgur.com/xcc7fFj.png)

You can then see your API key in the window that opens:

![Teamspeak ClientQuery Settings](https://i.imgur.com/QSYtVpP.png)

## Controlling the client

If you have configured everything correctly and the plugin is loaded, you can mute your microphone or all sounds by POSTing a body with the following content:

```json
{ "action": "mic|sound" }
```

This will then toggle either your microphone mute state or your sound mute state on the currently connected server.

Full example using `curl` (replace `<username>`, `<client>` and `<valid_auth>` with appropriate values)

	 curl -d '{"action":"sound"}' -H "Content-Type: application/json" https://connect.webhookify.net/<username>/<client>/teamspeak?auth=<valid_auth>
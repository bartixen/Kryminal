module.exports = {
  name: 'Control Server Prefix',
  section: 'Server Control',

  subtitle (data) {
    if (parseInt(data.controlType) === 1) {
      return 'Delete server prefix'
    } else {
      return `Set server prefix: ${data.prefix}`
    }
  },

  fields: ['server', 'controlType', 'varName', 'prefix'],

  html (isEvent, data) {
    return `
<div>
  <div style="float: left; width: 35%;">
    Server:<br>
    <select id="server" class="round" onchange="glob.serverChange(this, 'varNameContainer')">
      ${data.servers[isEvent ? 1 : 0]}
    </select>
  </div>
  <div id="varNameContainer" style="display: none; float: right; width: 60%;">
    Variable Name:<br>
    <input id="varName" class="round" type="text" list="variableList">
  </div>
</div><br><br><br>
<div style="padding-top: 8px; width: 35%; float: left">
  Control Type:
  <select id="controlType" class="round" onchange="glob.onChangeControl(this)">
    <option value="0" title="Sets the prefix of the server">Set Prefix</option>
    <option value="1" title="Sets the prefix to default prefix (settings)">Delete Prefix</option>
  </select>
</div>
<div id="prefixContainer" style="padding-top: 8px; width: 60%; float: right">
  Prefix:<br>
  <input id="prefix" class="round" type="text">
</div>`
  },

  init () {
    const { glob, document } = this

    glob.serverChange(document.getElementById('server'), 'varNameContainer')
    glob.onChangeControl = function (controlType) {
      document.getElementById('prefixContainer').style.display = [null, 'none'][parseInt(controlType.value)]
    }

    glob.onChangeControl(document.getElementById('controlType'))
  },

  action (cache) {
    const fs = require('fs')
    const path = require('path')
    const data = cache.actions[cache.index]
    const type = parseInt(data.server)
    const { Actions } = this.getDBM()

    const varName = this.evalMessage(data.varName, cache)
    const server = this.getServer(type, varName, cache)
    const controlType = parseInt(data.controlType)
    const prefix = this.evalMessage(data.prefix, cache)
    const settingsPath = path.join('data', 'serverSettings.json')

    fs.readFile(settingsPath, 'utf8', (err, data) => {
      if (err) return Actions.displayError(data, cache, err)
      const json = JSON.parse(data)
      if (controlType === 0) {
        json[server.id] = prefix
      } else if (controlType === 1 && json[server.id]) {
        delete json[server.id]
        delete server.prefix
      }

      fs.writeFile(settingsPath, JSON.stringify(json), (err) => {
        if (err) return Actions.displayError(data, cache, err)
        server.prefix = prefix
        Actions.callNextAction(cache)
      })
    })
  },

  mod () {}
}

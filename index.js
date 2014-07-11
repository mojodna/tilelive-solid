"use strict";

var url = require("url");

var mapnik = require("mapnik"),
    tiletype = require("tiletype");

module.exports = function(tilelive, options) {
  var Solid = function(uri, callback) {
    if (typeof(uri) === "string") {
      uri = url.parse(uri, true);
    }

    // abusive way of supporting solid:#fff and solid:rgba(127,127,127,0.5)
    this.color = uri.hash || decodeURIComponent(uri.hostname + (uri.pathname || "").slice(1));
    this.format = uri.query.format || "png";
    this.tileSize = (uri.query.tileSize | 0) || 256;

    return setImmediate(function() {
      var im = new mapnik.Image(this.tileSize, this.tileSize);

      im.background = new mapnik.Color(this.color);

      return im.encode(this.format, function(err, buffer) {
        if (err) {
          return callback(err);
        }

        this.image = buffer;
        this.headers = tiletype.headers(tiletype.type(buffer));

        return callback(null, this);
      }.bind(this));
    }.bind(this));
  };

  Solid.prototype.getTile = function(z, x, y, callback) {
    return setImmediate(function() {
      return callback(null, this.image, this.headers);
    }.bind(this));
  };

  Solid.prototype.getInfo = function(callback) {
    return setImmediate(function() {
      return callback(null, {
        layers: this.layers,
        offsets: this.offsets,
        opacities: this.opacities,
        operations: this.operations,
        filters: this.filters,
        format: this.format
      });
    }.bind(this));
  };

  Solid.prototype.close = function(callback) {
    return callback && setImmediate(callback);
  };

  Solid.registerProtocols = function(tilelive) {
    tilelive.protocols["solid:"] = Solid;
  };

  Solid.registerProtocols(tilelive);

  return Solid;
};

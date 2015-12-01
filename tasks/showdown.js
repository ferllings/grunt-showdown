/*
 * grunt-showdown
 * https://github.com/vincent314/grunt-showdown
 *
 * Copyright (c) 2014 vincent314
 * Licensed under the MIT license.
 */

'use strict';
var Showdown = require('showdown');
var path = require('path');
var fs = require('fs');

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('showdown', 'Showdown grunt plugin', function () {
        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                fileExtension: 'md',
                extensions: [],
                customExtensions: []
            }
        );

        options.customExtensions.forEach(function (ext) {
            options.extensions.push(require(ext));
        });


        var showdown = new Showdown.Converter({extensions: options.extensions});
        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            var writer;
            if (!grunt.file.exists(f.dest) || grunt.file.isFile(f.dest)) {
                writer = fs.createWriteStream(f.dest);
                grunt.log.writeln('Creating unique file ' + f.dest);
            }

            // Concat specified files.
            f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(f.cwd || '', filepath)) {
                    grunt.log.warn('Source file "' + path.join(f.cwd || '', filepath) + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).forEach(function (file) {
                var filepath = path.join(f.cwd || '', file);
                var result = showdown.makeHtml(grunt.file.read(filepath));

                if (writer) {
                    writer.write(result);
                } else {
                    var destPath = f.dest + "/" + file.replace(new RegExp('\\.' + options.fileExtension + '$'), '');
                    var destFile = destPath + ".html";
                    grunt.file.write(destFile, result);
                    grunt.log.writeln('File "' + destFile + '" created.');
                }

            });

            if (writer) {
                // Flush and wait for file writing
                writer.end(function () {
                    console.log('End of writing');
                    done();
                });
            } else {
                done();
            }
        });
    });

};

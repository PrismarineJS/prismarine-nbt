'use strict';

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,

		jshint: {
			options: {
				camelcase: true,
				curly: true,
				eqeqeq: true,
				forin: true,
				immed: true,
				newcap: true,
				noarg: true,
				node: true,
				nonbsp: true,
				quotmark: 'single',
				smarttabs: true,
				strict: true,
				sub: true,
				trailing: true,
				unused: true
			},
			files: [
				'nbt.js',
				'sample/sapmple.js',
				'Gruntfile.js'
			]
		},
	});
};

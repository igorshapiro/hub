module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['spec/spec_helper.js', 'spec/**/*.js']
      }
    }
  });

  grunt.registerTask('default', 'mochaTest');
  grunt.registerTask('test', 'mochaTest')
};

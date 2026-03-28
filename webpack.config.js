const Encore = require('@symfony/webpack-encore');

Encore
.setOutputPath('public/')
.setPublicPath('/bundles/markocupiccontaonewsinfinitescroll')
.setManifestKeyPrefix('')

//.addEntry('frontend', './assets/frontend.js')

.copyFiles({
    from: './assets/js',
    to: 'js/[path][name].[hash:8].[ext]',
})

.disableSingleRuntimeChunk()
.cleanupOutputBeforeBuild()
.enableSourceMaps()
.enableVersioning()

// enables @babel/preset-env polyfills
.configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
})
;

module.exports = Encore.getWebpackConfig();

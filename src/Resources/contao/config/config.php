<?php

/**
 * Created by PhpStorm.
 * User: Marko
 * Date: 06.09.2015
 * Time: 17:20
 */
if(TL_MODE == 'FE' && !\Environment::get('isAjaxRequest')){
    $GLOBALS['TL_JAVASCRIPT'][] = 'bundles/markocupiccontaonewsinfinitescroll/js/contao_news_infinite_scroll.js';
}

$GLOBALS['FE_MOD']['news']['contao_newslist_infinite_scroll'] = 'Markocupic\ModuleContaoNewsListInfiniteScroll';






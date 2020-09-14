<?php

/**
 * Contao News Infinite Scroll Bundle
 *
 * Copyright (c) 2020 Marko Cupic
 *
 * @author Marko Cupic <https://github.com/markocupic>
 *
 * @license LGPL-3.0+
 */


if (TL_MODE === 'FE' && !\Environment::get('isAjaxRequest'))
{
    $GLOBALS['TL_JAVASCRIPT'][] = 'bundles/markocupiccontaonewsinfinitescroll/js/news_infinite_scroll.min.js|static';
}

$GLOBALS['FE_MOD']['news']['newslist_infinite_scroll'] = Markocupic\ModuleNewslistInfiniteScroll::class;

$GLOBALS['TL_HOOKS']['parseArticles'][] = ['Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao\ParseArticlesListener', 'addCanonicalTag'];

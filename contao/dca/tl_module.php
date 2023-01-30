<?php

declare(strict_types=1);

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic 2023 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

/**
 * Fields
 */
$GLOBALS['TL_DCA']['tl_module']['fields']['newsInfiniteScroll_addCanonicalTag'] = [
    'exclude'   => true,
    'inputType' => 'checkbox',
    'eval'      => ['tl_class' => 'w50'],
    'sql'       => "char(1) NOT NULL default ''",
];

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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\ContaoManager;

use Contao\ManagerPlugin\Bundle\BundlePluginInterface;
use Contao\ManagerPlugin\Bundle\Config\BundleConfig;
use Contao\ManagerPlugin\Bundle\Parser\ParserInterface;
use SomeVendor\ContaoExampleBundle\ContaoExampleBundle;

/**
 * Class Plugin
 *
 * @package Markocupic\ContaoNewsInfiniteScrollBundle\ContaoManager
 */
class Plugin implements BundlePluginInterface
{
    /**
     * @param ParserInterface $parser
     * @return array
     */
    public function getBundles(ParserInterface $parser): array
    {

        return [
            BundleConfig::create('Markocupic\ContaoNewsInfiniteScrollBundle\MarkocupicContaoNewsInfiniteScrollBundle')
                ->setLoadAfter([
                    'Contao\NewsBundle\ContaoNewsBundle',
                ]),
        ];
    }
}

<?php

/**
 * Contao News Infinite Scroll Bundle
 *
 * Copyright (c) 2021 Marko Cupic
 *
 * @author Marko Cupic <https://github.com/markocupic>
 *
 * @license LGPL-3.0+
 */

namespace Markocupic\ContaoNewsInfiniteScrollBundle\ContaoManager;

use Contao\ManagerPlugin\Bundle\BundlePluginInterface;
use Contao\ManagerPlugin\Bundle\Config\BundleConfig;
use Contao\ManagerPlugin\Bundle\Parser\ParserInterface;
use Contao\ManagerPlugin\Config\ConfigPluginInterface;
use Markocupic\ResourceBookingBundle\DependencyInjection\Compiler\AddSessionBagsPass;
use Symfony\Component\Config\Loader\LoaderInterface;

/**
 * Plugin for the Contao Manager.
 *
 * @author Marko Cupic
 */
class Plugin implements BundlePluginInterface, ConfigPluginInterface
{

    /**
     * @param LoaderInterface $loader
     * @param array $managerConfig
     * @throws \Exception
     */
    public function registerContainerConfiguration(LoaderInterface $loader, array $managerConfig)
    {
        $loader->load(__DIR__ . '/../Resources/config/listener.yml');
    }

    /**
     * {@inheritdoc}
     */
    public function getBundles(ParserInterface $parser)
    {
        return [
            BundleConfig::create('Markocupic\ContaoNewsInfiniteScrollBundle\MarkocupicContaoNewsInfiniteScrollBundle')
                ->setLoadAfter([
                    'Contao\CoreBundle\ContaoCoreBundle',
                    'Contao\NewsBundle\ContaoNewsBundle',
                ]),
        ];
    }
}

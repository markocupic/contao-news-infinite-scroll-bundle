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
use Markocupic\ResourceBookingBundle\DependencyInjection\Compiler\AddSessionBagsPass;
use Symfony\Component\Config\Loader\LoaderInterface;

/**
 * Plugin for the Contao Manager.
 *
 * @author Marko Cupic
 */
class Plugin implements BundlePluginInterface
{

    /**
     * @param LoaderInterface $loader
     * @param array $managerConfig
     * @throws \Exception
     */
    public function registerContainerConfiguration(LoaderInterface $loader, array $managerConfig)
    {
        $loader->load(__DIR__ . '/../Resources/config/parameters.yml');
        $loader->load(__DIR__ . '/../Resources/config/listener.yml');
        $loader->load(__DIR__ . '/../Resources/config/services.yml');
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
                ]),
        ];
    }
}

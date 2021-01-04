<?php

/**
 * Contao News Infinite Scroll Bundle
 *
 * Copyright (c) 2021 Marko Cupic
 *
 * @author Marko Cupic <https://github.com/markocupic/contao-news-infinite-scroll-bundle>
 *
 * @license LGPL-3.0+
 */

declare(strict_types=1);

namespace Markocupic\ContaoNewsInfiniteScrollBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

/**
 * Class MarkocupicContaoNewsInfiniteScrollExtension
 *
 * @package Markocupic\ContaoNewsInfiniteScrollBundle\DependencyInjection
 */
class MarkocupicContaoNewsInfiniteScrollExtension extends Extension
{
    /**
     * @param array $configs
     * @param ContainerBuilder $container
     * @throws \Exception
     */
    public function load(array $configs, ContainerBuilder $container): void
    {

        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('listener.yml');
    }
}

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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao;

use Contao\FrontendTemplate;
use Contao\Input;
use Contao\Module;
use Contao\Environment;
use Contao\CoreBundle\Framework\ContaoFramework;

/**
 * Class ParseArticlesListener
 * @package Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao
 */
class ParseArticlesListener
{
    /**
     * @var ContaoFramework
     */
    private $framework;

    /**
     * ParseArticlesListener constructor.
     * @param ContaoFramework $framework
     */
    public function __construct(ContaoFramework $framework)
    {
        $this->framework = $framework;
    }

    /**
     * @param FrontendTemplate $template
     * @param array $newsEntry
     * @param Module $module
     */
    public function addCanonicalTag(FrontendTemplate $template, array $newsEntry, Module $module): void
    {
        // Prevent duplicate content by adding the canonical url into the head.
        if ($module->type === 'newslist_infinite_scroll' && $module->newsInfiniteScroll_addCanonicalTag)
        {
            $id = 'page_n' . $module->id;

            /** @var Environment $environmentAdapter */
            $environmentAdapter = $this->framework->getAdapter(Environment::class);

            $strTag = sprintf('<link rel="canonical" href="%s">',
                $environmentAdapter->get('url') . '/' . str_replace('?' . $environmentAdapter->get('queryString'), '', $environmentAdapter->get('request'))
            );

            /** @var Input $inputAdaper */
            $inputAdaper = $this->framework->getAdapter(Input::class);

            if ($inputAdaper->get($id) !== null && is_array($GLOBALS['TL_HEAD']) && !in_array($strTag, $GLOBALS['TL_HEAD']))
            {
                $GLOBALS['TL_HEAD'][] = $strTag;
            }
        }
    }
}

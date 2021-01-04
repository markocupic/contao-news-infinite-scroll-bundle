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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao;

use Contao\System;
use Contao\Template;
use Contao\CoreBundle\Framework\ContaoFramework;

/**
 * Class ParseTemplateListener
 * @package Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao
 */
class ParseTemplateListener
{
    /** @var ContaoFramework */
    protected $framework;

    /**
     * ParseTemplateListener constructor.
     */
    public function __construct()
    {
        /** @var ContaoFramework framework */
        $this->framework = System::getContainer()->get('contao.framework');
    }

    /**
     * Add an id to the template because we need it to use vue.js
     * @param Template $objTemplate
     */
    public function addId(Template $objTemplate): void
    {
        if (strpos($objTemplate->getName(), 'mod_newslist_infinite_scroll') === 0)
        {
            if (!preg_match('/(.*)id=(\"|\')(.*)(\"|\')/', $objTemplate->cssID))
            {
                $objTemplate->cssID .= ' id="newslistInfiniteScroll_' . $objTemplate->id . '"';
            }
        }
    }

}

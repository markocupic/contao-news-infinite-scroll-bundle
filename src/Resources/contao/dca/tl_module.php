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

// Onload callbacks (keep this order!)
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = ['tl_module_contao_news_infinite_scroll', 'showJsLibraryHint'];
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = ['tl_module_contao_news_infinite_scroll', 'addFieldsToPalette'];
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = ['tl_module_contao_news_infinite_scroll', 'setPalette'];

// Fields
$GLOBALS['TL_DCA']['tl_module']['fields']['newsInfiniteScroll_addCanonicalTag'] = [
    'label'     => &$GLOBALS['TL_LANG']['tl_module']['newsInfiniteScroll_addCanonicalTag'],
    'exclude'   => true,
    'inputType' => 'checkbox',
    'eval'      => ['tl_class' => 'w50'],
    'sql'       => "char(1) NOT NULL default ''"
];

/**
 * Provide miscellaneous methods that are used by the data configuration array.
 *
 * @author Marko Cupic <https://github.com/markocupic>
 */
class tl_module_contao_news_infinite_scroll extends \Contao\Backend
{

    /**
     * Import the back end user object
     */
    public function __construct()
    {
        parent::__construct();
        $this->import('BackendUser', 'User');
    }

    /**
     * Show a hint if a JavaScript library needs to be included in the page layout
     * @param object
     */
    public function showJsLibraryHint($dc)
    {
        if ($_POST || Input::get('act') != 'edit')
        {
            return;
        }

        // Return if the user cannot access the layout module (see #6190)
        if (!$this->User->hasAccess('themes', 'modules') || !$this->User->hasAccess('layout', 'themes'))
        {
            return;
        }

        $objMod = \Contao\ModuleModel::findByPk($dc->id);

        if ($objMod === null)
        {
            return;
        }

        if ($objMod->type === 'newslist_infinite_scroll')
        {
            \Contao\Message::addInfo(sprintf($GLOBALS['TL_LANG']['tl_module']['includeContaoNewsInfiniteScrollTemplate'], 'j_news_infinite_scroll'));
        }
    }

    /**
     * Add dca fields to palette
     * @param $dc
     */
    public function addFieldsToPalette($dc)
    {
        $objMod = \Contao\ModuleModel::findByPk($dc->id);

        if ($objMod === null)
        {
            return;
        }

        if ($objMod->type === 'newslist_infinite_scroll')
        {
            // Manipulate palettes
            \Contao\CoreBundle\DataContainer\PaletteManipulator::create()
                ->addLegend('news_infinite_scroll_legend', 'protected_legend', Contao\CoreBundle\DataContainer\PaletteManipulator::POSITION_BEFORE)
                ->addField(['newsInfiniteScroll_addCanonicalTag'], 'news_infinite_scroll_legend', Contao\CoreBundle\DataContainer\PaletteManipulator::POSITION_APPEND)
                ->applyToPalette('newslist', 'tl_module');
        }
    }

    /**
     * Sets the newslist_infinite_scroll palette as late as possible.
     */
    public function setPalette()
    {
        $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist_infinite_scroll'] = $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist'];
    }

}

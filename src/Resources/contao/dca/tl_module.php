<?php

/**
 * Contao Open Source CMS
 *
 * Copyright (c) 2005-2015 Leo Feyer
 *
 * @license LGPL-3.0+
 */


/**
 * Add palettes to tl_module
 */
$GLOBALS['TL_DCA']['tl_module']['palettes']['contao_news_infinite_scroll'] = $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist'];


$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = array('tl_module_contao_news_infinite_scroll', 'showJsLibraryHint');


/**
 * Provide miscellaneous methods that are used by the data configuration array.
 *
 * @author Leo Feyer <https://github.com/leofeyer>
 */
class tl_module_contao_news_infinite_scroll extends Backend
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
     *
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

        $objMod = ModuleModel::findByPk($dc->id);

        if ($objMod === null)
        {
            return;
        }

        if($objMod->type == 'newslist_infinite_scroll')
        {
            Message::addInfo(sprintf($GLOBALS['TL_LANG']['tl_module']['includeContaoNewsInfiniteScrollTemplate'], 'j_contao_news_infinite_scroll'));

        }
    }
}
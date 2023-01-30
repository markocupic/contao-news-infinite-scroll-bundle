<?php

declare(strict_types=1);

use Symplify\EasyCodingStandard\Config\ECSConfig;
use PhpCsFixer\Fixer\Comment\HeaderCommentFixer;

return static function (ECSConfig $ECSConfig): void {

    $services = $ECSConfig->services();

    $services
        ->set(HeaderCommentFixer::class)
        ->call('configure', [[
            'header' => "This file is part of Contao News Infinite Scroll Bundle.\n\n(c) Marko Cupic 2023 <m.cupic@gmx.ch>\n@license LGPL-3.0+\nFor the full copyright and license information,\nplease view the LICENSE file that was distributed with this source code.\n@link https://github.com/markocupic/contao-news-infinite-scroll-bundle",
        ]])
    ;
};

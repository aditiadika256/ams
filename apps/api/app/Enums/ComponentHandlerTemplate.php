<?php

namespace App\Enums;

enum ComponentHandlerTemplate: string
{
    case Information = 'INFORMATION';
    case ExternalLink = 'EXTERNAL_LINK';
    case FileDownload = 'FILE_DOWNLOAD';
    case EmbeddedPage = 'EMBEDDED_PAGE';
    case Video = 'VIDEO';
    case Form = 'FORM';
    case Iframe = 'IFRAME';
    case Native = 'NATIVE';
}

import { LightGallery } from '../../lightgallery';
import { VimeoThumbnailSettings } from './lg-vimeo-thumbnail-settings';
/**
 * Creates the vimeo thumbnails plugin.
 * @param {object} element - lightGallery element
 */
export default class VimeoThumbnail {
    core: LightGallery;
    settings: VimeoThumbnailSettings;
    constructor(instance: LightGallery);
    init(): void;
    setVimeoThumbnails(dynamicGallery: LightGallery): Promise<void>;
    destroy(): void;
}

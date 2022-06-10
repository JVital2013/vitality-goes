import { LgQuery, lgQuery } from '../../lgQuery';
import { LightGallery } from '../../lightgallery';
interface Coords {
    x: number;
    y: number;
}
interface DragAllowedAxises {
    allowX: boolean;
    allowY: boolean;
}
interface ZoomTouchEvent {
    pageX: number;
    targetTouches: {
        pageY: number;
        pageX: number;
    }[];
    pageY: number;
}
interface PossibleCords {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export default class Zoom {
    private core;
    private settings;
    private $LG;
    private previousScale;
    zoomableTimeout: any;
    positionChanged: boolean;
    pageX: number;
    pageY: number;
    scale: number;
    imageYSize: number;
    imageXSize: number;
    containerRect: ClientRect;
    rotateValue: number;
    modifierX: number;
    modifierY: number;
    dragAllowedAxises: DragAllowedAxises;
    top: number;
    left: number;
    scrollTop: number;
    constructor(instance: LightGallery, $LG: LgQuery);
    buildTemplates(): void;
    /**
     * @desc Enable zoom option only once the image is completely loaded
     * If zoomFromOrigin is true, Zoom is enabled once the dummy image has been inserted
     *
     * Zoom styles are defined under lg-zoomable CSS class.
     */
    enableZoom(event: CustomEvent): void;
    enableZoomOnSlideItemLoad(): void;
    getModifier(rotateValue: number, axis: string, el: HTMLElement): number;
    getImageSize($image: HTMLImageElement, rotateValue: number, axis: string): number;
    getDragCords(e: MouseEvent, rotateValue: number): Coords;
    getSwipeCords(e: TouchEvent, rotateValue: number): Coords;
    /**
     *
     * @param scale When image portratit image is rotated and scaled, check the reset values
     * @returns
     */
    getDragAllowedAxises(scale?: number): DragAllowedAxises;
    /**
     *
     * @param {Element} el
     * @return matrix(cos(X), sin(X), -sin(X), cos(X), 0, 0);
     * Get the current transform value
     */
    getCurrentTransform(el: HTMLElement): string[] | undefined;
    getCurrentRotation(el: HTMLElement): number;
    setZoomEssentials(): void;
    /**
     * @desc Image zoom
     * Translate the wrap and scale the image to get better user experience
     *
     * @param {String} scale - Zoom decrement/increment value
     */
    zoomImage(scale: number, out?: boolean): void;
    resetImageTranslate(): void;
    setZoomImageSize(scale: number): void;
    /**
     * @desc apply scale3d to image and translate to image wrap
     * @param {style} X,Y and scale
     */
    setZoomStyles(style: {
        x: number;
        y: number;
        scale: number;
    }, possibleSwipeCords?: any, dragAllowedAxises?: any): void;
    /**
     * @param index - Index of the current slide
     * @param event - event will be available only if the function is called on clicking/taping the imags
     */
    setActualSize(index: number, event?: ZoomTouchEvent): void;
    getNaturalWidth(index: number): number;
    getActualSizeScale(naturalWidth: number, width: number): number;
    getCurrentImageActualSizeScale(): number;
    getPageCords(event?: ZoomTouchEvent): Coords;
    setPageCords(event?: ZoomTouchEvent): void;
    manageActualPixelClassNames(): void;
    beginZoom(scale: number): boolean;
    getScale(scale: number): number;
    init(): void;
    zoomIn(): void;
    resetZoom(index?: number): void;
    getTouchDistance(e: TouchEvent): number;
    pinchZoom(): void;
    touchendZoom(startCoords: Coords, endCoords: Coords, allowX: boolean, allowY: boolean, touchDuration: number, rotateValue: number): void;
    getZoomSwipeCords(startCoords: Coords, endCoords: Coords, allowX: boolean, allowY: boolean, possibleSwipeCords: PossibleCords): Coords;
    private isBeyondPossibleLeft;
    private isBeyondPossibleRight;
    private isBeyondPossibleTop;
    private isBeyondPossibleBottom;
    isImageSlide(): boolean;
    getPossibleSwipeDragCords(rotateValue: number, scale?: number): PossibleCords;
    getStaticPossibleSwipeDragCords(scale?: number): PossibleCords;
    setZoomSwipeStyles(LGel: lgQuery, distance: {
        x: number;
        y: number;
    }): void;
    zoomSwipe(): void;
    zoomDrag(): void;
    closeGallery(): void;
    destroy(): void;
}
export {};

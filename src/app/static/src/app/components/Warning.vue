<template>
    <div v-if="warnings.length > 0">
        <h5 class="alert-heading pt-2">
            <vue-feather type="alert-triangle" size="1.0rem" class="custom-class mr-1 mb-1 align-middle"></vue-feather>
            <span v-translate="headerText(origin)"></span>
        </h5>
        <!-- The outer styled divs are the visible window of warnings and inside them are the 
        full window of warnings (the warningBox), which is always rendered as html but with 
        its overflow hidden by the outer box. The size of the outer box dynamically adjusts 
        depending on the size of the warningBox and whether the user has clicked show more or less. -->
        <div :style="{ overflowY: 'hidden', height: `${renderedBoxHeight}px` }">
            <ul class="mb-0" ref="warningBox" id="warningBox">
                <li v-for="warning in warnings" :key="warning.text"><div :style="(lineStyling as any)">{{ warning.text }}</div></li>
            </ul>
            <!-- The below element will never be shown to the user but is used as a proxy to 
            dynamically determine the height in pixels the warnings window should have.  -->
            <p ref="line" class="mb-0 invisible">Hidden line</p>
        </div>
        <button @click="toggleShowFullBox" v-if="warningsLengthy" class="btn btn-link alert-link">{{ buttonText }}</button>
    </div>                 
</template>

<script lang="ts">
    import VueFeather from "vue-feather";
    import i18next from "i18next";
    import { mapStateProp } from "../utils";
    import { RootState } from "../root";
    import { Language } from "../store/translations/locales";
    import { Warning } from "../generated";
    import { PropType, defineComponent, nextTick } from "vue";

    export default defineComponent({
        name: "Warning",
        props: {
            origin: {
                type: String,
                required: true
            },
            warnings: {
                type: Array as PropType<Warning[]>,
                required: true
            },
            maxLines: {
                default: 2,
                required: false,
                type: Number
            }
        },
        data() {
            return {
                showFullBox: false,
                fullBoxHeight: 0,
                lineHeight: 0
            };
        },
        computed: {
            renderedBoxHeight(){
                if (!this.warningsLengthy){
                    return this.fullBoxHeight
                } else {
                    return this.showFullBox ? this.fullBoxHeight : this.maxBoxHeight
                }
            },
            maxBoxHeight(){
                const maxLinesDefault = this.maxLines || 2
                return maxLinesDefault * this.lineHeight
            },
            warningsLengthy(){
                return this.fullBoxHeight > this.maxBoxHeight
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            buttonText(){
                return i18next.t(this.showFullBox ? "showLess" : "showMore", { lng: this.currentLanguage });
            },
            // The user has the option to configure the number of lines that will be displayed. 
            // If the height of the warnings rendered are more than this number, each warning 
            // will be truncated to one line and the show more button will appear. If there is 
            // only one warning message, it will be truncated after the max number of lines
            lineStyling(){
                if (this.warningsLengthy && !this.showFullBox){
                    if (this.warnings.length === 1){
                        return {
                            height: `${this.maxBoxHeight}px`,
                            overflow: "hidden",
                            "display": "-webkit-box",
                            "-webkit-line-clamp": this.maxLines,
                            "-webkit-box-orient": "vertical"
                        }
                    } else {
                        return {
                            height: `${this.lineHeight}px`,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }
                    }
                } else {
                    return {}
                }
            }
        },
        methods: {
            toggleShowFullBox(){
                this.showFullBox = !this.showFullBox;
                if (this.showFullBox){
                    this.updateDimensions();
                }
            },
            async updateDimensions(){
                this.fullBoxHeight = 0;
                await nextTick();
                if (this.$refs.warningBox) {
                    this.lineHeight = (this.$refs.line as HTMLElement).clientHeight;
                    this.fullBoxHeight = (this.$refs.warningBox as HTMLElement).clientHeight;
                }
            },
            headerText(key: string){
                const headers: { [key: string]: string } = {
                    modelOptions: "warningsHeaderModelOptions",
                    modelRun: "warningsHeaderModelRun",
                    modelCalibrate: "warningsHeaderModelCalibrate",
                    reviewInputs: "warningsHeaderReviewInputs"
                }
                return key in headers ? headers[key] : ""
            }
        },
        watch: {
            warnings(){
                this.updateDimensions()
            }
        },
        mounted(){
            this.updateDimensions()
        },
        components: {
            VueFeather
            // AlertTriangleIcon
        }
    })
</script>

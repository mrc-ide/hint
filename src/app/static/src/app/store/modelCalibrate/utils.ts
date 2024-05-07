import { Filter } from "../../generated"
import { ModelOutputTabs } from "../../types"
import { FetchResultDataPayload } from "../plottingSelections/actions"

type FeatureOption = {
    id: string,
    label: string,
    children: FeatureOption[]
}

class Queue {
    items: FeatureOption[]
    constructor(elems: FeatureOption[]) { this.items = elems }
    enqueue(elem: FeatureOption) { this.items.push(elem) }
    dequeue() { return this.items.pop()! }
    isEmpty() { return this.items.length === 0 }
}

const findNodes = (root: FeatureOption, areaIds: string[]) => {
    let seekAreaIds = areaIds;
    const q = new Queue([root]), nodes: FeatureOption[] = [];
    while (!q.isEmpty() && seekAreaIds.length > 0) {
        const feature = q.dequeue();
        if (seekAreaIds.includes(feature.id)) {
            seekAreaIds = seekAreaIds.filter(id => id !== feature.id);
            nodes.push(feature);
        }
        if (feature.children && feature.children.length > 0) {
            feature.children.forEach(child => q.enqueue(child));
        }
    }
    return nodes;
};

const getChildrenIds = (root: FeatureOption) => {
    const q = new Queue([root]), childrenIds: string[] = [];
    while (!q.isEmpty()) {
        const feature = q.dequeue();
        if (feature.children && feature.children.length > 0) {
            feature.children.forEach(child => {
                childrenIds.push(child.id);
                q.enqueue(child);
            });
        }
    }
    return childrenIds;
};

const getNestedChildrenIds = (features: FeatureOption[], areaIds: string[]) => {
    const fakeParentNode: FeatureOption = { id: "", label: "", children: features };
    const nodes = findNodes(fakeParentNode, areaIds);
    const fakeRootNode: FeatureOption = { id: "", label: "", children: nodes }; 
    return getChildrenIds(fakeRootNode);
};

export const getPayloadWithNestedAreas = (payload: FetchResultDataPayload, tab: ModelOutputTabs, rootGetters: any) => {
    if (tab !== ModelOutputTabs.Map && tab !== ModelOutputTabs.Bubble) return payload;
    if (!payload.area_id || payload.area_id.length === 0) return payload;
    const areas = payload.area_id;
    const filters = rootGetters["modelOutput/choroplethFilters"] as Filter[];
    const areaOptions = filters.find(f => f.id === "area")!.options;
    const childrenIds = getNestedChildrenIds(areaOptions as any, areas);
    const newPayload = {...payload, area_id: childrenIds};
    return newPayload;
};
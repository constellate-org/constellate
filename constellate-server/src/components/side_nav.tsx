import React from "react";
import { EuiSideNav, htmlIdGenerator } from "@elastic/eui";

import type { Constellation } from "../lib/constellate";

import { appendIconComponentCache } from "@elastic/eui/es/components/icon/icon";

import { icon as ad } from "@elastic/eui/es/components/icon/assets/arrow_down";
import { icon as ar } from "@elastic/eui/es/components/icon/assets/arrow_right";
import { icon as menu } from "@elastic/eui/es/components/icon/assets/menu";
import { icon as apps } from "@elastic/eui/es/components/icon/assets/apps";

// One or more icons are passed in as an object of iconKey (string): IconComponent
appendIconComponentCache({
    arrowDown: ad,
    arrowRight: ar,
    menu: menu,
    apps: apps,
});

class SideBarClass extends React.Component<{
    constellation: Constellation;
    currId: number;
}> {
    constructor(props) {
        super(props);
    }

    breadCrumbs() {
        const stars = this.props.constellation.stars;
        const titles = this.props.constellation.star_titles;
        const crumbs = [];
        const ids_to_crumbs = {};
        this.props.constellation.breadcrumbs.forEach((bc, i) => {
            // if title or intro, don't add anything
            if (bc.length == 1) {
                // if only one parent, then it's a new outer-level section
                const crumb = {
                    name: titles[i],
                    id: htmlIdGenerator("bc")(),
                    items: [],
                    href: `/${this.props.constellation.slug}/${i}`,
                };

                ids_to_crumbs[stars[i].star_id] = crumb;
                crumbs.push(crumb);
            } else if (bc.length > 1) {
                const parent_id = stars[bc[bc.length - 1]].star_id;
                let crumb;
                if (titles[i] !== "") {
                    // node page: add into correct area
                    crumb = {
                        name: titles[i],
                        id: htmlIdGenerator("bc")(),
                        items: [],
                        href: `/${this.props.constellation.slug}/${i}`,
                    };
                    ids_to_crumbs[parent_id].items.push(crumb);
                } else {
                    crumb = ids_to_crumbs[parent_id];
                }

                ids_to_crumbs[stars[i].star_id] = crumb;
            } else {
                // beginning page, no highlights
            }
        });
        return [ids_to_crumbs, crumbs];
    }

    render() {
        const [ids_to_crumbs, crumbs] = this.breadCrumbs();
        const currStarId =
            this.props.constellation.stars[this.props.currId].star_id;
        if (ids_to_crumbs[currStarId] != null) {
            ids_to_crumbs[currStarId].isSelected = true;
        }
        return (
            <>
                <EuiSideNav
                    aria-label="Outline"
                    mobileTitle="Outline"
                    items={[
                        {
                            name: this.props.constellation.title,
                            href: `/${this.props.constellation.slug}/1`,
                            id: htmlIdGenerator("bc")(),
                            // @ts-ignore
                            items: crumbs,
                        },
                    ]}
                    heading="Outline"
                    truncate={false}
                    headingProps={{ screenReaderOnly: true }}
                />
            </>
        );
    }
}

export default function SideBar(props) {
    return (
        <SideBarClass constellation={props.constellation} currId={props.currId} />
    );
}

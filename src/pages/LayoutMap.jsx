import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

import layoutMap from "../assets/layout-map.png";
import plotPositions from "../data/plotPositions";

import "./LayoutMap.css";

function LayoutMap() {

    const [plots, setPlots] = useState([]);

    useEffect(() => {

        getPlots();

    }, []);

    async function getPlots() {

        const { data } = await supabase
            .from("plots")
            .select("*");

        setPlots(data || []);

    }

    function getStatus(plotNo) {

        const plot = plots.find(
            p => p.plot_no === plotNo
        );

        if (!plot) return "available";

        return plot.status.toLowerCase();

    }

    function openPlot(plotNo){

        const plot = plots.find(
            p => p.plot_no === plotNo
        );

        console.log(plot);

    }

    return (

        <div className="layout-page">

            <div className="layout-wrapper">

                <img
                    src={layoutMap}
                    alt=""
                    className="layout-image"
                />

                {

                    plotPositions.map(plot => (

                        <div

                            key={plot.plot_no}

                            className={`plot-box ${getStatus(plot.plot_no)}`}

                            style={{

                                left: plot.left,

                                top: plot.top,

                                width: plot.width,

                                height: plot.height

                            }}

                            onClick={() =>
                                openPlot(plot.plot_no)
                            }

                        >

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default LayoutMap;
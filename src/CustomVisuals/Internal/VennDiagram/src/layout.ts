export function createPolylinesAndLables(leaderLines: d3.Selection<SVGElement>, leaderLabels: d3.Selection<SVGElement>) {

        //Remove existing elememts
        leaderLines.selectAll('.venn-leader-line').remove();
        leaderLabels.selectAll('.venn-leader-label').remove();

        //Create leader lines
        leaderLines.append('polyline')
            .classed('venn-leader-line venn-first-line', true)
        leaderLines.append('polyline')
            .classed('venn-leader-line venn-second-line', true);
        leaderLines.append('polyline')
            .classed('venn-leader-line venn-overlap-line', true);

        //Create leader labels
        leaderLabels.append('text')
            .classed('venn-leader-label venn-first-label', true);
        leaderLabels.append('text')
            .classed('venn-leader-label venn-second-label', true);
        leaderLabels.append('text')
            .classed('venn-leader-label venn-overlap-label', true);
    }
}

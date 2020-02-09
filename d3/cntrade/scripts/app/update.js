function update(y,m) {

    updateMonths(y,m);

    buildChords(y,m);

   // mainLabel.style("font-size",innerRadius *.05);

    eText = eGroup.selectAll("g.group")
        .data(e_labels, function (d) {
            return d.label;
        });

    iText = iGroup.selectAll("g.group")
        .data(i_labels, function (d) {
            return d.label;
        });

    eChords=eGroup.selectAll("g.chord")
        .data(e_chords, function (d) {
            return d.label;
        });

    iChords=iGroup.selectAll("g.chord")
        .data(i_chords, function (d) {
            return d.label;
        });

    var td=((monthlyExports[y*12+m] - monthlyImports[y*12+m]))//*-1//顺差trade surplus删除*-1，逆差trade deficit则保留
    var fs=innerRadius *.1;
    td=formatCurrency(td);

    dGroup.transition()
        .select("text")
        .delay(delay)
        .text(td)
        .attr("transform", "translate(" + (outerRadius - (td.length * fs/2)/2) + ","  + (outerRadius*1.1) +")")
        .style("font-size", fs + "px");

    eText.enter()
        .append("g")
        .attr("class", "group")
        .append("text")
        .attr("class","export")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return  (d.index+1)  + ". " + d.label; })
        .on("mouseover", function (d) { node_onMouseOver(d); })//console.log(d.angle)
        .on("mouseout", function (d) {node_onMouseOut(d); });

    eText.transition()
        .duration(delay-10)
        .select("text")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + (d.angle > 0 ? 6 : 36)) + ")"// + "translate(" + (innerRadius + 6) + ")"
                + (d.angle < 0 ? "rotate(180)" : "");  // + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return  (d.index+1)  + ". " + d.label; });

    eText.exit().remove();

    eChords.enter()
        .append("g")
        .attr("class","chord")
        .append("path")
        .attr("class","chord")
        .style("stroke", function(d) { return d3.rgb(getExportColor(d.source.index)).darker(); })
        .style("fill", function(d) { return getExportColor(d.source.index); })
        .style("fill-opacity", function (d,i) { return .85*(topCountryCount- d.index)/topCountryCount})
        .attr("d", d3.svg.arc_chord().radius(innerRadius))
        .style("opacity",0)
        .on("mouseover", function (d) { node_onMouseOver(d); })
        .on("mouseout", function (d) {node_onMouseOut(d); });


    eChords.transition()
        .select("path")
        .duration(delay)
        .attr("d", d3.svg.arc_chord().radius(innerRadius))
        .style("stroke", function(d) { return d3.rgb(getExportColor(d.source.index)).darker(); })
        .style("fill", function(d) { return getExportColor(d.source.index); })
        .style("stroke-opacity", function (d,i) { return Math.max(.85*(topCountryCount-d.index)/topCountryCount,.2);})
        .style("fill-opacity", function (d,i) { return .85*(topCountryCount-d.index)/topCountryCount})
        .style("opacity",1);


    eChords.exit()
        .remove();

    iText.enter()
        .append("g")
        .attr("class", "group")
        .append("text")
        .attr("class","import")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return  (d.index+1)  + ". " + d.label; })
        .on("mouseover", function (d) { node_onMouseOver(d); })
        .on("mouseout", function (d) {node_onMouseOut(d); });

    iText.transition()
        .duration(delay-10)
        .select("text")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return  (d.index+1)  + ". " + d.label; });
		
		
    iText.exit()
        .remove();

    iChords.enter()
        .append("g")
        .attr("class","chord")
        .append("path")
        .attr("class","chord")
        .style("stroke", function(d) { return d3.rgb(getImportColor(d.source.index)).darker(); })
        .style("stroke-opacity", function (d,i) { return Math.max(.85*(topCountryCount-d.index)/topCountryCount,.2);})
        .style("fill", function(d) { return getImportColor(d.source.index); })
        .style("fill-opacity", function (d,i) { return .7*(topCountryCount- d.index)/topCountryCount})
        .attr("d", d3.svg.arc_chord().radius(innerRadius))
        .style("opacity",0)
        .on("mouseover", function (d) { node_onMouseOver(d); })
        .on("mouseout", function (d) {node_onMouseOut(d); });

    iChords.transition()
        .select("path")
        .duration(delay-10)
        .attr("d", d3.svg.arc_chord().radius(innerRadius))
        .style("stroke", function(d) { return d3.rgb(getImportColor(d.source.index)).darker(); })
        .style("fill", function(d) { return  getImportColor(d.source.index); })
        .style("stroke-opacity", function (d,i) { return Math.max(.85*(topCountryCount-d.index)/topCountryCount,.2);})
        .style("fill-opacity", function (d,i) { return .7*(topCountryCount- d.index)/topCountryCount})
        .style("opacity",1);
		
    iChords.exit()
        .remove();

}

function updateMonths(y,m) {

    var monthAxis=mGroup.selectAll("g.month")
        .data(months);

    monthEnter= monthAxis.enter()
        .append("g")
        .attr("class","month");

    monthEnter.append("line")
        .attr("x1",function (d,i) {
            return i*monthOffset;
        })
        .attr("x2",function (d,i) { return i*monthOffset; })
        .attr("y1",function (d,i) {
            var ratio=(y*12+m)-i;
            if (ratio < 0) ratio=ratio*-1;
            if (ratio==0)
                return 0;
            else if (ratio==1)
                return 4;
            else if (ratio==2)
                return 8;
            else if (ratio==3)
                return 11;
            else if (ratio==4)
                return 14;
            else if (ratio==5)
                return 15;
            else if (ratio==6)
                return 15;
            else
                return 16;

        })
        .attr("y2",22)
        .attr("shape-rendering","crispEdges")
        .style("stroke-opacity", function (d,i) {
            var ratio=(y*12+m)-i;
            if (ratio < 0) ratio=ratio*-1;
            if (ratio==0)
                return 1;
            else if (ratio==1)
                return .9;
            else if (ratio==2)
                return .8;
            else if (ratio==3)
                return .7;
            else if (ratio==4)
                return .6;
            else if (ratio==5)
                return .5;
            else if (ratio==6)
                return .4;
            else
                return .3;

        })
        .style("stroke","#000");



    monthEnter.append("text")
        .attr("transform",function (d,i) { return "translate (" + String(i*monthOffset-10) + ",-2)"; })
        .text(function(d,i) { return monthsMap[i % 12]; })
        .style("fill-opacity",function (d,i) { return (i==0) ? 1:0;});

    monthEnter.append("text")
        .attr("transform",function (d,i) { return "translate (" + String(i*monthOffset-10) + ",33)"; })
        .text(function(d,i) {
            if ((i==0) || (i % 12==0)) {
                return String(baseYear + Math.floor(i/12));
            }
            else
                return "";
        })
        .on("click",function (d) {
            year= Math.floor(d.index/12);
            month=0;
            if (running==true) stopStart();
            update(year,month);
            //          console.log("y=" + y + " m=" + m);
        });

    monthUpdate=monthAxis.transition();

    monthUpdate.select("text")
        .delay(delay/2)
        .style("fill-opacity",function (d) {
            if (d.index==(y*12+m)) {
                return 1;
            }
            else
                return 0;
        });

    monthUpdate.select("line")
        .delay(delay/2)
        .attr("y1",function (d,i) {
            var ratio=(y*12+m)-i;
            if (ratio < 0) ratio=ratio*-1;
            if (ratio==0)
                return 0;
            else if (ratio==1)
                return 4;
            else if (ratio==2)
                return 8;
            else if (ratio==3)
                return 11;
            else if (ratio==4)
                return 14;
            else if (ratio==5)
                return 15;
            else if (ratio==6)
                return 15;
            else
                return 16;

        })
        .style("stroke-width",function (d,i) {
            var ratio=(y*12+m)-i;
            if (ratio < 0) ratio=ratio*-1;
            if (ratio==0)
                return 1.5;
            else
                return 1;
        })
        .style("stroke-opacity", function (d,i) {
            var ratio=(y*12+m)-i;
            if (ratio < 0) ratio=ratio*-1;
            if (ratio==0)
                return 1;
            else if (ratio==1)
                return .9;
            else if (ratio==2)
                return .8;
            else if (ratio==3)
                return .7;
            else if (ratio==4)
                return .6;
            else if (ratio==5)
                return .5;
            else if (ratio==6)
                return .4;
            else
                return .3;

        })
        .style("stroke","#000");

}


function getExportColor(i) {
    var country=e_nameByIndex[i];
    if (e_colorByName[country]==undefined) {
        e_colorByName[country]=e_fill(i);
    }

    return e_colorByName[country];
}

function getImportColor(i) {
    var country=i_nameByIndex[i];
    if (i_colorByName[country]==undefined) {
        i_colorByName[country]=i_fill(i);
    }

    return i_colorByName[country];
}

function buildChords(y,m) {//调用_buildChords.js

    countries=countriesGrouped[y].values[m].values;

    countries.sort(function (a,b) {
        //Descending Sort
        if (a.Exports > b.Exports) return -1;
        else if (a.Exports < b.Exports) return 1;
        else return 0;
    });

    export_countries=countries.slice(0,topCountryCount);

    countries.sort(function (a,b) {
        //Descending Sort
        if (a.Imports > b.Imports) return -1;
        else if (a.Imports < b.Imports) return 1;
        else return 0;
    });

    import_countries=countries.slice(0,topCountryCount);

    var  import_matrix = [],
        export_matrix = [];

    e_buf_indexByName=e_indexByName;
    i_buf_indexByName=i_indexByName;

    e_indexByName=[];
    e_nameByIndex=[];
    i_indexByName=[];
    i_nameByIndex=[];
    n = 0;

    // Compute a unique index for each package name
    totalExports=0;
    export_countries.forEach(function(d) {
        totalExports+= Number(d.Exports);
        d = d.Country;
        if (!(d in e_indexByName)) {
            e_nameByIndex[n] = d;
            e_indexByName[d] = n++;
        }
    });

    export_countries.forEach(function(d) {
        var source = e_indexByName[d.Country],
            row = export_matrix[source];
        if (!row) {
            row = export_matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        row[e_indexByName[d.Country]]= d.Exports;
    });

    // Compute a unique index for each country name.
    n=0;
    totalImports=0;
    import_countries.forEach(function(d) {
        totalImports+= Number(d.Imports);
        d = d.Country;
        if (!(d in i_indexByName)) {
            i_nameByIndex[n] = d;
            i_indexByName[d] = n++;
        }
    });

    import_countries.forEach(function(d) {
        var source = i_indexByName[d.Country],
            row = import_matrix[source];
        if (!row) {
            row = import_matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        row[i_indexByName[d.Country]]= d.Imports;
    });

    var exportRange=angleRange*(totalExports/(totalExports + totalImports));
    var importRange=angleRange*(totalImports/(totalExports + totalImports));
    export_chord.startAngle(-(exportRange/2))
        .endAngle((exportRange/2));

    import_chord.startAngle(180-(importRange/2))
        .endAngle(180+(importRange/2));

    import_chord.matrix(import_matrix);
    export_chord.matrix(export_matrix);

    var tempLabels=[];
    var tempChords=[];

    for (var i=0; i < e_labels.length; i++) {
        e_labels[i].label='null';
        e_chords[i].label='null';
    }

    for (var i=0; i < export_chord.groups().length; i++) {
        var d={}
        var g=export_chord.groups()[i];
        var c=export_chord.chords()[i];
        d.index=i;
        d.angle= (g.startAngle + g.endAngle) / 2;
        d.label = e_nameByIndex[g.index];
        d.exports= c.source.value;
		//console.log(c.source.value);//
        var bIndex=e_buf_indexByName[d.label];
        if (typeof bIndex != 'undefined') {  //Country already exists so re-purpose node.
            e_labels[bIndex].angle= d.angle;
            e_labels[bIndex].label= d.label;
            e_labels[bIndex].index= i;
            e_labels[bIndex].exports= d.exports;

            e_chords[bIndex].index= i;
            e_chords[bIndex].label= d.label;
            e_chords[bIndex].source= c.source;
            e_chords[bIndex].target= c.target;
            e_chords[bIndex].exports = d.exports;

        }
        else { //Country doesnt currently exist so save for later
            tempLabels.push(d);
            tempChords.push(c);
        }
    }

    //Now use up unused indexes
    for (var i=0; i < e_labels.length; i++) {
        if (e_labels[i].label=="null") {
            var o=tempLabels.pop();
            e_labels[i].index=e_indexByName[o.label];
            e_labels[i].label= o.label;
            e_labels[i].angle= o.angle;
            e_labels[i].exports= o.exports;

            var c=tempChords.pop();
            e_chords[i].label= o.label;
            e_chords[i].index= i;
            e_chords[i].source= c.source;
            e_chords[i].target= c.target;
            e_chords[i].exports= c.exports;

        }
    }


    tempLabels=[];
    tempChords=[];

    for (var i=0; i < i_labels.length; i++) {
        i_labels[i].label='null';
        i_chords[i].label='null';
    }

    for (var i=0; i < import_chord.groups().length; i++) {
        var d={}
        var g=import_chord.groups()[i];
        var c=import_chord.chords()[i];
        d.index=i;
        d.angle= (g.startAngle + g.endAngle) / 2;
        d.label = i_nameByIndex[g.index];
        d.imports = c.source.value;
        var bIndex=i_buf_indexByName[d.label];
        if (typeof bIndex != 'undefined') {  //Country already exists so re-purpose node.
            i_labels[bIndex].angle= d.angle;
            i_labels[bIndex].label= d.label;
            i_labels[bIndex].imports= d.imports;
            i_labels[bIndex].index= i;

            i_chords[bIndex].index= i;
            i_chords[bIndex].label= d.label;
            i_chords[bIndex].source= c.source;
            i_chords[bIndex].target= c.target;
            i_chords[bIndex].imports= d.imports;

        }
        else { //Country doesnt currently exist so save for later
            tempLabels.push(d);
            tempChords.push(c);
        }
    }

    //Now use up unused indexes
    for (var i=0; i < i_labels.length; i++) {
        if (i_labels[i].label=="null") {
            var o=tempLabels.pop();
            i_labels[i].index=i_indexByName[o.label];
            i_labels[i].label= o.label;
            i_labels[i].angle= o.angle;
            i_labels[i].imports= o.imports;

            var c=tempChords.pop();
            i_chords[i].label= o.label;
            i_chords[i].index= i;
            i_chords[i].source= c.source;
            i_chords[i].target= c.target;
            i_chords[i].imports= c.imports;

        }
    }

    function getFirstIndex(index,indexes) {
        for (var i=0; i < topCountryCount; i++) {
            var found=false;
            for (var y=index; y < indexes.length; y++) {
                if (i==indexes[y]) {
                    found=true;
                }
            }
            if (found==false) {
                return i;
                //  break;
            }
        }
        //      console.log("no available indexes");
    }

    function getLabelIndex(name) {
        for (var i=0; i < topCountryCount; i++) {
            if (e_buffer[i].label==name) {
                return i;
                //   break;
            }
        }
        return -1;
    }
	
}
// https://jsfiddle.net/ef51xk3y/
// https://www.delftstack.com/howto/javascript/rgb-to-hex-javascript/

function ColorToHex(color) {
    let hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}
  
export default function ConvertRGBtoHex(arr) {
    let colors = []
    for (let i = 0; i < arr.length; i++) {
        colors.push("#" + ColorToHex(arr[i][0]) + ColorToHex(arr[i][1]) + ColorToHex(arr[i][2]))
    }
    return sortColors(colors);
}

function colorDistance(color1, color2) {
    // This is actually the square of the distance but
    // this doesn't matter for sorting.
    var result = 0;
    for (var i = 0; i < color1.length; i++)
        result += (color1[i] - color2[i]) * (color1[i] - color2[i]);
    return result;
}

function sortColors(colors) {
    // Calculate distance between each color
    let distances = [];
    for (let i = 0; i < colors.length; i++) {
        distances[i] = [];
        for (let j = 0; j < i; j++)
            distances.push([colors[i], colors[j], colorDistance(colors[i], colors[j])]);
    }
    distances.sort(function(a, b) {
        return a[2] - b[2];
    });

    // Put each color into separate cluster initially
    let colorToCluster = {};
    for (let i = 0; i < colors.length; i++)
        colorToCluster[colors[i]] = [colors[i]];

    // Merge clusters, starting with lowest distances
    let lastCluster;
    for (let i = 0; i < distances.length; i++) {
        let color1 = distances[i][0];
        let color2 = distances[i][1];
        let cluster1 = colorToCluster[color1];
        let cluster2 = colorToCluster[color2];
        if (!cluster1 || !cluster2 || cluster1 == cluster2)
            continue;

        // Make sure color1 is at the end of its cluster and
        // color2 at the beginning.
        if (color1 != cluster1[cluster1.length - 1])
            cluster1.reverse();
        if (color2 != cluster2[0])
            cluster2.reverse();

        // Merge cluster2 into cluster1
        cluster1.push.apply(cluster1, cluster2);
        delete colorToCluster[color1];
        delete colorToCluster[color2];
        colorToCluster[cluster1[0]] = cluster1;
        colorToCluster[cluster1[cluster1.length - 1]] = cluster1;
        lastCluster = cluster1;
    }

    // By now all colors should be in one cluster
    return lastCluster;
}
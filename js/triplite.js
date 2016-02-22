$(function(){
  var data= [
      { value: 'hyderabad', data: 'hyderabad' },
      { value: 'mumbai', data: 'mumbai' },
      { value: 'bangalore', data: 'bangalore' },
      { value: 'delhi', data: 'delhi' },
      { value: 'cochin', data: 'cochin' }
  ]; 
  
  var buses = {
      'hyderabad':'124',
      'cochin':'731',
      'mumbai':'462',
      'delhi':'71867',
      'bangalore':'122'
  };
  
  var flights = {
      'hyderabad':'HYD',
      'delhi':'DEL',
      'cochin':'COK',
      'mumbai':'BOM',
      'bangalore':'BLR'
  };
  
  var origin,destination,hop,date,type,combinedResult={},counter=0,combo={},HIDE_INDEX=4;
  
  var fill = function(origin,destination,hop,dateArr){
    $("#origin_autocomplete").val(origin);
    $("#destination_autocomplete").val(destination);
    $("#hop_autocomplete").val(hop);
    $("#date").val(dateArr[2]+"-"+dateArr[1]+"-"+dateArr[0]);
  };
  
  var strip = function(name){
    name = name.replace(/\s+/g,' ').trim();
    if(name.length > 9){
        var nameArr = name.split(" ");
        var length = nameArr[0].length;
        if(nameArr.length > 1)
            length+=nameArr[1].length;
        if(length > 9)
            return nameArr[0];
        else
            return nameArr[0]+" "+nameArr[1];
    }
    else
        return name;
  };
  
  var populate_helper = function(response,type){
      var html = "";
      response.sort(function(a,b){
         if(type.indexOf("_od") > -1) 
            return a.price - b.price;
         else if(type.indexOf("_oh") > -1)
            return new Date('1970/01/01 ' + a.arrival_time) - new Date('1970/01/01 ' + b.arrival_time);
         else if(type.indexOf("_hd") > -1)
            return new Date('1970/01/01 ' + a.depart_time) - new Date('1970/01/01 ' + b.depart_time);
      });
      
      var title = (type.indexOf("_od")== -1 )?(type.indexOf("_oh")== -1 )?(type.indexOf("_hd")== -1 )?"":"from "+hop+" to "+destination+"":"from "+origin+" to "+hop+"":"from "+origin+" to "+destination+"";
      var t = type.split("_")[1];
      $("#"+t+"_result_header").html("<tr><td colspan='5'>"+title+"</td></tr>");
      for( var i in response){
          html+="<tr";
          if(type.indexOf("_od")> -1 && i > HIDE_INDEX)
            html+=" class = 'hide' ";
          html+="><td class='name'><span ";
          if(type.indexOf("buses")> -1)
            html+="style='background-position: -520px 0;' ";
          html+="class='flight_span flight_"+String(response[i].name).replace(/ +/g,"")+"'></span><p class='flight_name'>"+strip(response[i].name)+"</p></td><td class='departure'><p>"+response[i].depart_time+"</p><p class='dt'>("+response[i].depart_date.split(",")[1].trim()+")</p></td><td class='arrival'><p>"+response[i].arrival_time+"</p><p class='dt'>("+response[i].arrival_date.split(",")[1].trim()+")</p></td><td class='duration'>"+response[i].duration+"</td><td class='price'> &#8377;"+response[i].price+"</td></tr>";
      }
      if(type.indexOf("_od")>-1&&response.length>HIDE_INDEX)
        html+="<tr class='showAll'><td colspan='5'>Show all results ...</td></tr>";
      $("#searchresults #"+type+"_results").html(html);
  };
  
  var populate = function(response,type){
      if(type == "both"){
          populate_helper(response.flights_od,"flights_od");
          populate_helper(response.buses_od,"buses_od");
          populate_helper(response.flights_oh,"flights_oh");
          populate_helper(response.buses_oh,"buses_oh");
          populate_helper(response.flights_hd,"flights_hd");
          populate_helper(response.buses_hd,"buses_hd"); 
          $(".main").addClass('hide');
          $("#searchresults").removeClass('hide');
      }
      else
        populate_helper(response,type);
  };
  
  var urlcorrect = function(){
    var h = window.location.href;
    var str="../";
    if(h.split("/").length==7)
        str="../../../";
    return str;
  }
  
  var pop_ticks = function(origin,destination,hop){
      $("#tick_flights_oh p").html("flights from "+origin+" to "+hop);
      $("#tick_flights_od p").html("flights from "+origin+" to "+destination);
      $("#tick_flights_hd p").html("flights from "+hop+" to "+destination);  
      $("#tick_buses_oh p").html("buses from "+origin+" to "+hop);      
      $("#tick_buses_od p").html("buses from "+origin+" to "+destination);  
      $("#tick_buses_hd p").html("buses from "+hop+" to "+destination);      
  };
  
  var ajax = function(origin,destination,hop,date,state){
      $(".main").addClass('hide');
      pop_ticks(origin,destination,hop);
      $("#loader").removeClass('hide');
      var u = urlcorrect();
      combinedResult={};
      window.history.pushState(null,state,window.location.href.replace(/\.io.*$/,".io")+state);
      $.ajax({
          url: u+"Makemytrip.py",
          type: "get",
          dataType: "json",
          data: {'origin':flights[origin],'destination':flights[destination],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"flights_od");
          }
      });
      $.ajax({
          url: u+"Redbus.py",
          type: "get",
          dataType: "json",
          data: {'origin':buses[origin],'destination':buses[destination],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"buses_od");
          }
      });
      $.ajax({
          url: u+"Makemytrip.py",
          type: "get",
          dataType: "json",
          data: {'origin':flights[origin],'destination':flights[hop],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"flights_oh");
          }
      });
      $.ajax({
          url: u+"Redbus.py",
          type: "get",
          dataType: "json",
          data: {'origin':buses[origin],'destination':buses[hop],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"buses_oh");
          }
      });
      $.ajax({
          url: u+"Makemytrip.py",
          type: "get",
          dataType: "json",
          data: {'origin':flights[hop],'destination':flights[destination],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"flights_hd");
          }
      }); 
      $.ajax({
          url: u+"Redbus.py",
          type: "get",
          dataType: "json",
          data: {'origin':buses[hop],'destination':buses[destination],'date':date},
          success: function(response){
              sync(response,origin,destination,hop,date,state,"buses_hd");
          }
      });      
  };
  
  var progress = function(c){
      var r = parseFloat((100/6)*c);
      $(".progress-bar").css({'width':r+'%'});
  }
  
  var tick = function(type){
      $("#tick_"+type+" span").css('background-position','0px 0px');
      $("#tick_"+type+" p").css('color','#f66d52');
  }
  
  var sync = function(response,origin,destination,hop,date,state,type){
    counter ++;
    progress(counter);
    tick(type);
    if(type=="flights_od")
        combinedResult.flights_od = response;
    else if(type=="buses_od")
        combinedResult.buses_od = response;
    else if(type=="flights_oh")
        combinedResult.flights_oh = response;
    else if(type=="buses_oh")
        combinedResult.buses_oh = response;
    else if(type=="flights_hd")
        combinedResult.flights_hd = response;
    else if(type=="buses_hd")
        combinedResult.buses_hd = response;
    if(counter == 6){
        window.history.replaceState({'data':combinedResult,'origin':origin,'destination':destination,'hop':hop,'date':date},state,window.location.href);
        counter = 0;
        combo.flights_flights = algoresult(combinedResult.flights_oh,combinedResult.flights_hd);
        combo.buses_buses = algoresult(combinedResult.buses_oh,combinedResult.buses_hd);
        combo.flights_buses = algoresult(combinedResult.flights_oh,combinedResult.buses_hd);
        combo.buses_flights = algoresult(combinedResult.buses_oh,combinedResult.flights_hd); 
        populate(combinedResult,"both");
        movetodefault();
    }
  };
  
  var places={};
  
  var minutes = function(t){
      var pieces = t.split(":");
      if(pieces.length == 2)
        return (parseInt(pieces[0],10)*60) + parseInt(pieces[1],10) ;
  };
  
  var movetodefault = function(){
    var table_oh = {val:null};
    table_oh=gettable("#"+$('#oh_hd_inner').children('#oh').children('#oh_result_wrapper_parent').children('#oh_result_wrapper').attr("id"),table_oh);
    var table_hd = {val:null};
    table_hd=gettable("#"+$('#oh_hd_inner').children('#hd').children('#hd_result_wrapper_parent').children('#hd_result_wrapper').attr("id"),table_hd);
    var combo_ = getcombo(table_oh.val.attr('id').split("_")[0]+"_"+table_hd.val.attr('id').split("_")[0]);
    var suggestion_index = suggestion_algo(combo_);
    if(combo_!=null&&suggestion_index!=-1){
        table_oh.val.animate({'top':'-'+(combo_[suggestion_index].index1*90)+'px'},500);
        table_hd.val.animate({'top':'-'+(combo_[suggestion_index].index2*90)+'px'},500);
        $("#suggestion_text").html(suggestion_message(combo_[suggestion_index].duration));
        $("#suggestion_price").html("Total price: &#8377;"+combinedResult.flights_od[0].price,10);        
        $("#suggestion_saved").html(price_stats(combo_[suggestion_index].price));
    }else{
        $("#suggestion_text").html("Not a recommended option. ");
    }

  }; 
  
  
  var valid_indices = function(algo_result,i,j){
      if(algo_result===null)
        return null;
      var pos;
      for(pos=0;pos<algo_result.length;pos++){
          if((parseInt(algo_result[pos].index1,10)==parseInt(i,10)) && (parseInt(algo_result[pos].index2,10)==parseInt(j,10)) )
            if( (parseInt(algo_result[pos].duration,10)>=120) &&  (parseInt(algo_result[pos].duration,10) < 720))
                return pos;
      }
      return null;
  };
  
  var suggestion_algo = function(combo_result){
      var pos;
      for(pos=0;pos<combo_result.length;pos++){
          if( (parseInt(combo_result[pos].duration,10)>=300) &&  (parseInt(combo_result[pos].duration,10) < 480))
            return pos;
      }
      for(pos=0;pos<combo_result.length;pos++){
          if( (parseInt(combo_result[pos].duration,10)>=120) &&  (parseInt(combo_result[pos].duration,10) < 600))
            return pos;
      }      
      return -1;
  };
 
  var algoresult = function(response1,response2){
     var i,j,diff,delta,total_price;
     var result = {};
     var res = [];
     response1.sort(function(a,b){
       return new Date('1970/01/01 ' + a.arrival_time) - new Date('1970/01/01 ' + b.arrival_time);  
     });
     
     response2.sort(function(a,b){
       return new Date('1970/01/01 ' + a.depart_time) - new Date('1970/01/01 ' + b.depart_time);  
     });
     
     for(i=0;i<response1.length;i++){
         for(j=response2.length-1;j>=0;j--){
             diff = minutes(response2[j].depart_time) - minutes(response1[i].arrival_time);
             if(diff<120){
              break;   
             }
             else{
                 total_price = parseInt(response2[j].price,10) + parseInt(response1[i].price,10);
                 result = {"index1":i,"index2":j,"duration":diff,"price":total_price};
                 res.push(result);
             }
         }
     }
    res.sort(function(a,b){
        return parseInt(a.price,10)-parseInt(b.price,10);  
    });
     return res;
  };
  
  
  $(".place_autocomplete").autocomplete({
      lookup: data,
      onSelect: function(suggestion){
          places[$(this).attr('name')]= suggestion.value;
      }
  });
  
  var less_than_current_date = function(s){
      var bits = s.split('/');
      var d = new Date(bits[2], bits[1] - 1, bits[0]);
      if(d<new Date()){
        if((d.toDateString() === (new Date()).toDateString()))
            return false;
        $("#popup").html("Please enter a date starting from today");    
        return true;
      }
      else{
        return false;
      }
  }
  
  var isValidDate = function(s) {
      var bits = s.split('/');
      var d = new Date(bits[2], bits[1] - 1, bits[0]);
      return d && (d.getMonth() + 1) == bits[1] && d.getDate() == Number(bits[0]);
  } 
  
  var validate = function(origin,destination,hop,date){
      if(flights[origin]==null||flights[destination]==null||flights[hop]==null){
        $("#popup").html("Please enter valid search criteria");  
        return false;
      }
      else if(!isValidDate(date))
        return false;
      else if(less_than_current_date(date))
        return false;
      else
        return true;
  }
  
  var reset_ticks_and_progress = function(){
      $("#loader"+" span").css('background-position','50px 0px');
      $("#loader"+" p").css('color','#888');
      $(".progress-bar").css({'width':'0%'});
  };
  
  
  
  $('#submit').click(function(){
      origin = (places['origin']===null)?$("#origin_autocomplete").val():places['origin'];
      destination = (places['destination']===null)?$("#destination_autocomplete").val():places['destination'];
      hop = (places['hop']===null)?$("#hop_autocomplete").val():places['hop'];
      var dateArr = $("#date").val().split("-");
      date = dateArr[2]+"/"+dateArr[1]+"/"+dateArr[0];
      var state = "/"+origin+"/"+destination+"/"+hop+"/"+date.replace(/\//g,"-");
      if(validate(origin,destination,hop,date)){
          reset_ticks_and_progress();
          ajax(origin,destination,hop,date,state);
      }
      else{
          $("#popup").removeClass('hide');
          setTimeout(function(){ $("#popup").addClass('hide');}, 3000);
      }
  });
  
  $("#searchresults").on('click','table .showAll',function(){
    $(this).html("<td colspan='5'>Hide</td>");
    $(this).removeClass('showAll');
    $(this).addClass('hideAll');
    $(this).siblings().removeClass('hide');
  });
  
  $("#searchresults").on('click','table .hideAll',function(){
    $(this).html("<td colspan='5'>Show all results</td>");
    $(this).removeClass('hideAll');
    $(this).addClass('showAll');
    $(this).siblings().each(function(){
        if($(this).index()>HIDE_INDEX)
            $(this).addClass('hide');
    });
  });
  
  $(".selector").on('click','td',function(){
     if(!$(this).hasClass('selected')){
         var $sibling = $(this).siblings();
         $sibling.removeClass('selected');
         $("#"+$sibling.attr('id').replace('selector','results')).addClass('hide');
         $("#"+$(this).attr('id').replace('selector','results')).removeClass('hide');
         $(this).addClass('selected');
         movetodefault();
     } 
  });
  
  var gettable = function(id,table_){
      $(id).children('table').each(function(){
        if(!$(this).hasClass('hide'))
            table_.val=$(this);
      });
      return table_;
  };
  
  var getindex = function(table_obj){
      var table = table_obj.val;
      var top = Math.abs(parseInt(table.css('top'),10));
      return parseInt((top===0)?0:(top/90),10);
  };
  
  var getind = function(top){
      return parseInt((top==0)?0:(top/90),10);
  };
  
  var price_stats = function(price)
  {
     var combo_price = parseInt(price,10);
     var orig_price = parseInt(combinedResult.flights_od[0].price,10);
     var str="";
     if(combo_price<orig_price)
        str+="You saved: &#8377;"+(orig_price - combo_price);
      else
        str+="-";
      return str;
  };
  
  var suggestion_message = function(duration){
      var dur = parseInt(duration,10);
      var d = parseInt(duration/60,10) + ":" + parseInt(duration%60,10)+ " hrs";
      if(dur>=120 && dur<300)
        return "It might be too back to back with "+ d;
      else if(dur >=300 && dur<480)
        return "Recommended due to optimum transit time of "+ d;
      else if(dur >=480 && dur<720)
        return "You might have to linger around for " + d;
  };
  
  var callback = function(table_ind,ty,top){
    var i = getind(Math.abs(parseInt(top,10)));
    var table_sibling = {val:null};
    table_sibling=gettable("#"+table_ind.val.parent('div').parent('div').parent('div').siblings('div').children('.result_wrapper_parent').children('div').attr('id'),table_sibling);
    var j = getindex(table_sibling);
    if(ty=="oh"){
        var combo_left=getcombo(table_ind.val.attr('id').split('_')[0]+"_"+table_sibling.val.attr('id').split('_')[0]);
        var left_pos=valid_indices(combo_left,i,j);
        if(left_pos!=null){
            $("#suggestion_text").html(suggestion_message(combo_left[left_pos].duration));
            $("#suggestion_price").html("Total price: &#8377;"+combinedResult.flights_od[0].price,10);
            $("#suggestion_saved").html(price_stats(combo_left[left_pos].price));
        }
        else{
            $("#suggestion_text").html("Not a recommended option. ");
        }
    }
    else{
        var combo_right=getcombo(table_sibling.val.attr('id').split('_')[0]+"_"+table_ind.val.attr('id').split('_')[0]);
        var right_pos=valid_indices(combo_right,j,i);
        if(right_pos!=null){
            $("#suggestion_text").html(suggestion_message(combo_right[right_pos].duration));
            $("#suggestion_price").html("Total price: &#8377;"+combinedResult.flights_od[0].price,10);
            $("#suggestion_saved").html(price_stats(combo_right[right_pos].price));
        }
        else{
            var pr = (combo_left!=null&&price_stats(combo_right[right_pos])!=null)?price_stats(combo_right[right_pos].price):"";
            $("#suggestion_content").html("Not a recommended option. ");
        }
    }      
  }
  
  $(".arrows").click(function(){
    var idArr = $(this).attr('id').split("_");
    var table_ind = {val:null};
    var id = "#"+idArr[0]+"_"+idArr[1]+"_"+"wrapper";
    table_ind = gettable(id,table_ind);
    if(moveallowed(table_ind,idArr[2],parseFloat(table_ind.val.css('top')))){
      if(idArr[2]=="up")
        table_ind.val.animate({'top':(parseFloat(table_ind.val.css('top'))-90)+'px'},{duration:500,complete:callback(table_ind,idArr[0],parseFloat(table_ind.val.css('top'))-90)});
      else if (idArr[2]=="down")
        table_ind.val.animate({'top':(parseFloat(table_ind.val.css('top'))+90)+'px'},{duration:500,complete:callback(table_ind,idArr[0],parseFloat(table_ind.val.css('top'))+90)});
    }
  });
  
  var getcombo = function(str){
      if(str == "flights_flights")
        return combo.flights_flights;
      else if(str == "flights_buses")
        return combo.flights_buses;        
      else if(str == "buses_buses")
        return combo.buses_buses;        
      else if(str == "buses_flights")
        return combo.buses_flights;                
  };
  
  var moveallowed = function(table_obj,direction,top){
      var table = table_obj.val;
      var child;
      if(direction == "down" && parseInt(top+90,10)>0)
        return false;
      else if(top!=0 && direction == "up" && parseInt(top-90,10)<-((table.children('tr').length)-1)*90)
        return false;
      else
        return true;
  };

  window.onpopstate = function(e){
      if(e.state){
          var response = e.state.data;
          origin = e.state.origin;
          destination = e.state.destination;
          hop = e.state.hop;
          date = e.state.date;
          populate(response,"both");
          fill(origin,destination,hop,date.split("/"));
      }
      else if(window.location.href.match(/.*\.io(.+)$/)[1]!="/"){
          var str = window.location.href.match(/.*\.io(.+)$/)[1];
          var strArr = str.split("/");
          origin=strArr[1];
          destination=strArr[2];
          hop=strArr[3];
          date=strArr[4];
          reset_ticks_and_progress();
          ajax(origin,destination,hop,date.replace(/-/g,'/'),str);
          fill(origin,destination,hop,date.split("-"));          
      }
  };
  
  if(window.location.href.match(/.*\.io(.+)$/)[1]!="/"){
      var str = window.location.href.match(/.*\.io(.+)$/)[1];
      var strArr = str.split("/");
      origin=strArr[1];
      destination=strArr[2];
      hop=strArr[3];
      date=strArr[4];
      reset_ticks_and_progress();
      ajax(origin,destination,hop,date.replace(/-/g,'/'),str);
      fill(origin,destination,hop,date.split("-"));
  }

});
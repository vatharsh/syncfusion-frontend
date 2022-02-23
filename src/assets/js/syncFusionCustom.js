// start - global variables

var headerTextVal = null;
var xOffset= 0;
var yOffset=0;
var dialogContextMenu1 =  null;
var dialogEditMenu = null;
var dialogAddMenu = null;
var dialogChooseMenu = null;
var currSelectedHeaderItem = null;
var indexCurrSelectedHeaderItem = 0;
var currFreezedHeaderIndex = 0;
var bindGridStyle = false;
var intervalEvent;
var localTreeHeadersData= null;
var filteredColumns = [];
var indexCurrSelectedRow=null;
var timeoutId = 0;
var isDragDropEvent = false;
var drag =  false;
var touchEvent = false;
var scrolling = false;
var timerPlaceHolder =-1;
var eventBindingDoneOnLoad =false;
var triggered = false;

// end - global variables

// initial load
$(function(){
  $('.ui-widget-overlay').on('click', function () {
    $(this).parents("body").find(".ui-dialog-content").dialog("close");
  });

  $(document).on("contextmenu",function(e){
    return false;
  });

  bindOnLoadevents();
  setDefaults();

  $(document).on("mouseup",function(){
    scrolling = false;
    triggered =false;
  });

  $(document).on("DOMSubtreeModified", function(e) {
    treeHeaderRightClick();
    treeRowRightClick();
    bindPressureEventHeader();
    bindPressureEventRow();

    $('.e-rowdragdrop').off().on('mousedown',function(){
      drag =false;
    });
    $('.e-rowdragdrop').off().on('mousemove',function(){
      drag =true;
    });
    $('.e-rowdragdrop').off().on('mouseup',function(){
      drag =false;
    });

    $('div.e-content').off().on('scroll', () => {
      scrolling =true;
      clearTimeout(onScrollStopped.timeout);
      onScrollStopped.timeout = setTimeout(onScrollStopped, 200);
    });
  });

  timerPlaceHolder = setTimeout(() => {
    showHidePlaceHolder();
  }, 1000);

});


function onScrollStopped() {
  scrolling = false;
}

function showHidePlaceHolder() {
  var isSpinnerVisible = $('.e-spin-show').length > -1;
  if(!isSpinnerVisible) {
    if(!$('.e-headercell').is(':visible')) {
      $('.tree-grid-toolkit-placeholder').show();
      $('.e-row').hide();
      clearTimeout(timerPlaceHolder);
    }
    else {
      $('.tree-grid-toolkit-placeholder').hide();
      $('.e-row').show();
      clearTimeout(timerPlaceHolder);
    }

  }
}

function bindPressureEventHeader() {
    $('th.e-headercell').pressure({
      start: function(event){
        // this is called on force start
        touchEvent=true;
      },
      end: function(){
        // this is called on force end
      },
      startDeepPress: function(event){
        console.log(drag);
        // this is called on "force click" / "deep press", aka once the force is greater than 0.5
        if(touchEvent && !scrolling && !drag) {
          var $this = $(this);
          longPressHeader($this,event.x,event.y);
          touchEvent = false;
        }
      },
      endDeepPress: function(){
        touchEvent = false;
        scrolling=false;
        // this is called when the "force click" / "deep press" end
      },
      change: function(force, event){
        // this is called every time there is a change in pressure
        // 'force' is a value ranging from 0 to 1
      },
      unsupported: function(){
        // NOTE: this is only called if the polyfill option is disabled!
        // this is called once there is a touch on the element and the device or browser does not support Force or 3D touch
        if(!triggered)
          alert('Device is not supported for touch event. ERROR: SYNC-TOUCH-X001');
        triggered = true;
        touchEvent = false;
        scrolling=false;
      }
    });
}

function bindPressureEventRow() {
    $('tr.e-row').pressure({
      start: function(event){
        // this is called on force start
        touchEvent=true;
      },
      end: function(){
        // this is called on force end
        touchEvent = false;
        scrolling=false;
      },
      startDeepPress: function(event){
        // this is called on "force click" / "deep press", aka once the force is greater than 0.5
        if(touchEvent && !scrolling && !drag) {
          var $this = $(this);
          longPressRow($this,event.x,event.y);
          touchEvent = false;
        }
      },
      endDeepPress: function(){
        // this is called when the "force click" / "deep press" end
        touchEvent = false;
        scrolling=false
      },
      change: function(force, event){
        // this is called every time there is a change in pressure
        // 'force' is a value ranging from 0 to 1
      },
      unsupported: function(){
        // NOTE: this is only called if the polyfill option is disabled!
        // this is called once there is a touch on the element and the device or browser does not support Force or 3D touch
        if(!triggered)
          alert('Device is not supported for touch event. ERROR: SYNC-TOUCH-X001');
        triggered = true;
        touchEvent = false;
        scrolling=false;
      }
    });
}

function bindOnLoadevents() {
  //treeHeaderRightClick();
  //treeRowRightClick();
  chooseFilterSearch();
  //showHideFilterBar();
}

function longPressHeader(ele,x,y){
  var $this = ele;
  var currElem = $this;
  initializedContextMenuDialog();
  currFreezedHeaderIndex =$('#current-frozed-index').val();
  var contextMenu = $('#menu-right-click').parent();
  $this.addClass('selected-menu-item');
  currSelectedHeaderItem = currElem.find('div.e-headercelldiv');
  indexCurrSelectedHeaderItem =  $this.attr('aria-colindex');
  if(currFreezedHeaderIndex == indexCurrSelectedHeaderItem) {
    $('#freeze-col').prop('checked', true);
  } else {
    $('#freeze-col').prop('checked', false);
  }

  $('#current-selected-index').val(indexCurrSelectedHeaderItem);
  var parentOffset = $this.parent().offset();
  //or $(this).offset(); if you really just want the current element's offset
  var relX = x;//e.pageX-10;// parentOffset.left;
  var relY =  y;//e.pageY;//parentOffset.top+20;

  dialogContextMenu1.dialog( "open" );
  contextMenu.css("left",relX);
  contextMenu.css("top",relY);
  // console.log(relX+'--'+relY)
  xOffset = relX;
  yOffset = relY;
  headerTextVal = currElem.find('span').text();
  $('#current-selected-header-val').val(headerTextVal);
  if($('#'+headerTextVal+'_filterBarcell').parents().eq(1).is(':visible')) {
    $('#filter-col').prop('checked', true);
  } else {
    $('#filter-col').prop('checked', false);
  }
}

function treeHeaderRightClick() {
  $('.e-headercell').off().contextmenu(function(e){
  var $this = $(this);
    var currElem = $this;
    if(e.button ==2) {
    initializedContextMenuDialog();
    currFreezedHeaderIndex =$('#current-frozed-index').val();
      var contextMenu = $('#menu-right-click').parent();
      $this.addClass('selected-menu-item');
      currSelectedHeaderItem = currElem.find('div.e-headercelldiv');
      indexCurrSelectedHeaderItem =  $this.attr('aria-colindex');

      if(currFreezedHeaderIndex == indexCurrSelectedHeaderItem) {
        $('#freeze-col').prop('checked', true);
      } else {
        $('#freeze-col').prop('checked', false);
      }

      $('#current-selected-index').val(indexCurrSelectedHeaderItem);
      var parentOffset = $this.parent().offset();
      //or $(this).offset(); if you really just want the current element's offset
      var relX = e.pageX-10;// parentOffset.left;
      var relY =  e.pageY;//parentOffset.top+20;

      dialogContextMenu1.dialog( "open" );
      contextMenu.css("left",relX);
      contextMenu.css("top",relY);
      // console.log(relX+'--'+relY)
      xOffset = relX;
      yOffset = relY;
      headerTextVal = currElem.find('span').text();
      $('#current-selected-header-val').val(headerTextVal);
      if($('#'+headerTextVal+'_filterBarcell').parents().eq(1).is(':visible')) {
        $('#filter-col').prop('checked', true);
      } else {
        $('#filter-col').prop('checked', false);
      }
    }
  });
}

function longPressRow(ele,x,y){
  var $this = ele;
  var currElem = $this;
  $('div.ui-dialog').remove();
  initializedContextMenu2Dialog();
  clearTimeout(timeoutId);
  var contextMenu = $('#menu-right-click-row').parent();
  currElem.find('td:first').trigger('click');
  //$('.e-row').find('td').removeClass('e-selectionbackground e-active');
  // currElem.find('td').addClass('e-selectionbackground e-active');
  indexCurrSelectedRow =  currElem[0].ariaRowIndex;
  $('#current-selected-row-index').val(indexCurrSelectedRow);
  var parentOffset = $this.parent().offset();
  var relX = x;//e.pageX-10;// parentOffset.left;
  var relY =  y;//e.pageY;//parentOffset.top+20;

  dialogContextMenu2.dialog( "open" );
  contextMenu.css("left",relX);
  contextMenu.css("top",relY);
}

function treeRowRightClick() {
  $('tr.e-row').off().contextmenu(function(e){
    var $this = $(this);
    var currElem = $this;
    $('div.ui-dialog').remove();
    initializedContextMenu2Dialog();
    //console.log(currElem);
    if(e.button ==2) {
      var contextMenu = $('#menu-right-click-row').parent();
      currElem.find('td:first').trigger('click');
      //$('.e-row').find('td').removeClass('e-selectionbackground e-active');
      // currElem.find('td').addClass('e-selectionbackground e-active');
      indexCurrSelectedRow =  currElem[0].ariaRowIndex;
      $('#current-selected-row-index').val(indexCurrSelectedRow);
      var parentOffset = $this.parent().offset();
      var relX = e.pageX-10;// parentOffset.left;
      var relY =  e.pageY;//parentOffset.top+20;

      dialogContextMenu2.dialog( "open" );
      contextMenu.css("left",relX);
      contextMenu.css("top",relY);

    }
  });
}

function initializedContextMenuDialog() {
  dialogContextMenu1 = $('#menu-right-click').dialog({
    autoOpen: false,
    height: 'auto',
    width: '10',
    draggable: false,
    resizable: false,
    modal: true,
    closeText: 'Close',
      open: function() {
        $('.ui-widget-overlay').on('click', function () {
          //$(this).parents("body").find(".ui-dialog-content").dialog("close");
          $('div.ui-dialog').remove();
          if(currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
        });
      }
  }).on('keydown', function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        dialogContextMenu1.dialog('close');
        if(currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
    }
    evt.stopPropagation();
  });
}

function initializedContextMenu2Dialog() {
  dialogContextMenu2 = $('#menu-right-click-row').dialog({
    autoOpen: false,
    height: 'auto',
    width: '10',
    draggable: false,
    resizable: false,
    modal: true,
    closeText: 'Close',
      open: function() {
        $('.ui-widget-overlay').on('click', function () {
          $('div.ui-dialog').remove();
          //if(currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
        });
      }
  }).on('keydown', function(evt) {
    if (evt.keyCode === $.ui.keyCode.ESCAPE) {
        dialogContextMenu2.dialog('close');
        //if(currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
    }
    evt.stopPropagation();
  });
}

function initializedChooseDialog() {
  dialogChooseMenu = $('#context-menu-choose').dialog({
    autoOpen: false,
    height: 'auto',
    width: '10',
    draggable: false,
    resizable: false,
    modal: true,
    closeText: 'Close',
      open: function() {
        $('.ui-widget-overlay').on('click', function () {
          //$(this).parents("body").find(".ui-dialog-content").dialog("close");
          $('div.ui-dialog').remove();
        });
      }
  });
}

function showChooseDialog(){
  $('div.ui-dialog').remove();
  initializedChooseDialog();
  var chooseDialog = $('#context-menu-choose').parent();
  //console.log(xOffset+'--'+yOffset)
  setTimeout(() => {
    dialogChooseMenu.dialog("open");
    chooseDialog.css("left",xOffset);
    chooseDialog.css("top",yOffset);
  }, 500);

}

function closeModal () {
  $('div.ui-dialog').remove();
  setDefaults();
  if(typeof(currSelectedHeaderItem)!= "undefined" && currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
}

function setDefaults() {
  $('div.ui-dialog').remove();
  $('#input-menu-edit').val('');
  $('#input-menu-add').val('');
  $('#choosefilter').val('');
  $('#freeze-col').prop('checked', false);
  chooseFilterSearchSetDefaults();
  chooseFilterSearch();
  if(typeof(currSelectedHeaderItem)!= "undefined" && currSelectedHeaderItem != null) currSelectedHeaderItem.parent().removeClass('selected-menu-item');
  // $('.e-row').find('td').removeClass('e-selectionbackground e-active');
 }

function triggerEvents() {
  setTimeout(() => {
    bindOnLoadevents();
    setDefaults();
  }, 100);
}

function chooseFilterSearch() {
  $('#choosefilter').on('keyup', function() {
    var query = this.value;
    $('[id^="chk"]').each(function(i, elem) {
          if (elem.value.indexOf(query) != -1) {
            $(elem).show();
              $(elem).next().show();
          }else{
            $(elem).hide();
              $(elem).next().hide();
          }
    });
  });
}

function chooseFilterSearchSetDefaults() {
  $('[id^="chk"]').each(function(i, elem) {
      $(elem).show();
        $(elem).next().show();
  });
}

function addClassToHeader(elementRef,refName,color,bgColor) {
  setTimeout(() => {
    $('.e-columnheader .e-headercell.e-mousepointer:nth-child('+elementRef+')').addClass('dynamic-styling-'+refName);
    var cssStyle = "<style>.dynamic-styling-"+refName+"{color:"+color+"!important; background-color:"+bgColor+"!important;}</style>";
    $('head').append(cssStyle);
  }, 100);
}

function maintainStateOfGridAfterActionComplete(headers,bindLocal=false){
  var isGridLoading = true;
  var timer = setInterval(function() {
  isGridLoading = $('.e-spin-show').length > 0;
  //console.log(headers);
  resetFilterOnGridActionComplete();
  //showHideFilterBar();
  if(bindLocal)headers = localTreeHeadersData;
  var headerElem = null;
  var columnindex =-1;
  if (!isGridLoading && (typeof(headers)!="undefined" && headers !=null && headers !=''))
    {
      localTreeHeadersData = headers;
      var isFreezedColumns = $('.e-table:nth-child(1)').length>0;
      $.each(headers,function(index,item){
        //console.log(index);
        var colName =item.name;
        var color = item.fontColor;
        var backGroundColor =item.backgroundColor;
        //console.log(colName,color,backGroundColor);

        // below is non-freezed columns case
        var columnsInFirstContentGrid = $('.e-content .e-table:first tr:first td').length;
        if(columnsInFirstContentGrid == headers.length) {
          headerElem = $('.e-table:first').find('th:contains("'+colName+'")');
          headerElem.css({ backgroundColor: backGroundColor, color:color  });
          columnindex = headerElem.index();

          if(columnindex != -1)
          {
              $('.e-content .e-table:last tr').each(function(){
                  var column = $('td', this).eq(columnindex);
                  column.css({ backgroundColor: backGroundColor, color:color  });
                  if(item.textWrap == true) {
                    column.addClass('cell-text-wrap');
                  } else column.removeClass('cell-text-wrap');
              });
          }
          if(index == headers.length -1) {
            clearInterval(timer);
            headers = null;
          }
        }
        else {
            for(var i =0;i < columnsInFirstContentGrid;i++) {
              headerElem = $('.e-headercontent .e-table:first').find('th:contains("'+colName+'")');
              headerElem.css({ backgroundColor: backGroundColor, color:color  });
              columnindex = headerElem.index();

              if(columnindex != -1)
              {
                  $('.e-content .e-table:first tr').each(function(){
                      var column = $('td', this).eq(columnindex);
                      column.css({ backgroundColor: backGroundColor, color:color  });

                      if(item.textWrap == true) {
                        column.addClass('cell-text-wrap');
                      } else column.removeClass('cell-text-wrap');

                  });
              }
            }

            headerElem = $('.e-headercontent .e-table:last').find('th:contains("'+colName+'")');
            headerElem.css({ backgroundColor: backGroundColor, color:color  });
            columnindex = headerElem.index();

              if(columnindex != -1)
              {
                  $('.e-content .e-table:last tr').each(function(){
                      var column = $('td', this).eq(columnindex);
                      column.css({ backgroundColor: backGroundColor, color:color  });

                      if(item.textWrap == true) {
                        column.addClass('cell-text-wrap');
                      } else column.removeClass('cell-text-wrap');
                  });
              }

              if(index == headers.length -1) {
                clearInterval(timer);
                headers = null;
              }

        }
      });

    } else if(typeof(headers)!="undefined" || headers !=null || headers !='') {
      clearInterval(timer);
    }
  }, 200);
}

function showFilter(ele) {
  var $this = $(ele);
  var isChecked = $this.is(":checked");
  if(isChecked) {
    // $('#'+headerTextVal+'_filterBarcell').parents().eq(1).show();
    // filteredColumns.push(headerTextVal);
    $('.e-filterbar').show();
  }
  else  {
    // $('#'+headerTextVal+'_filterBarcell').parents().eq(1).hide();
    //   showHideFilterBar();
    //   var index = filteredColumns.indexOf(headerTextVal);
    //   if (index !== -1)  filteredColumns.splice(index,1);
    $('.e-filterbar').hide();
  }

  triggerEvents();
}

function showHideFilterBar() {
  setTimeout(() => {
    if($('.e-filterdiv').is(':visible')){
      $('.e-filterbar').show();
    }
    else {
      $('.e-filterbar').hide();
    }
  }, 100);
}

function resetFilterOnGridActionComplete() {
  $.each(filteredColumns,function(index,item){
    console.log(item);
    $('#'+item+'_filterBarcell').parents().eq(1).show();
  });
}












export POSH_THEME=::CONFIG::

TIMER_START="/tmp/${USER}.start.$$"

PS0='$(::OMP:: --millis > $TIMER_START)'

function _omp_hook() {
    local ret=$?

    omp_elapsed=-1
    if [[ -f $TIMER_START ]]; then
        omp_now=$(::OMP:: --millis)
        omp_start_time=$(cat "$TIMER_START")
        omp_elapsed=$((omp_now-omp_start_time))
        rm -f "$TIMER_START"
    fi
    PS1="$(::OMP:: --config $POSH_THEME --shell bash --error $ret --execution-time $omp_elapsed)"

    return $ret
}

if [ "$TERM" != "linux" ] && [ -x "$(command -v ::OMP::)" ] && ! [[ "$PROMPT_COMMAND" =~ "_omp_hook" ]]; then
    PROMPT_COMMAND="_omp_hook; $PROMPT_COMMAND"
fi

function _omp_runonexit() {
  [[ -f $TIMER_START ]] && rm -f "$TIMER_START"
}

trap _omp_runonexit EXIT

function export_poshconfig() {
    [ $# -eq 0 ] && { echo "Usage: $0 \"filename\""; return; }
    format=$2
    if [ -z "$format" ]; then
      format="json"
    fi
    ::OMP:: --config $POSH_THEME --print-config --config-format $format > $1
}

function export_poshimage() {
    author=$1
    rprompt_offset=$2
    if [ -z "$rPromptOffset" ]; then
      rprompt_offset=0
    fi
    if [ -n "$author" ]; then
      author="--author=$author"
    fi
    ::OMP:: --config $POSH_THEME --export-png --shell shell --rprompt-offset $rprompt_offset $author
}
